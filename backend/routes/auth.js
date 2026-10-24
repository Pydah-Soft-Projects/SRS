const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Role = require('../models/Role');
const { authenticateToken, requireSuperAdmin, requireSuperAdminOrPermission, hasPermission } = require('../middleware/auth');
const { sendEmail } = require('../config/email');

const router = express.Router();

const HRMS_URI = process.env.MONGODB_URI1 || 'mongodb+srv://teampydah:TeamPydah@teampydah.y4zj6wh.mongodb.net/hrms';
const HRMS_DB  = 'hrms';

// Cached connection helper for HRMS
const getHrmsDb = async () => {
  const clientOk = global._hrmsClient &&
    global._hrmsClient.topology &&
    global._hrmsClient.topology.isConnected();
  if (!clientOk) {
    const dns = require('dns');
    try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (_) {}
    global._hrmsClient = new MongoClient(HRMS_URI, { serverSelectionTimeoutMS: 10000 });
    await global._hrmsClient.connect();
    console.log('✅ [HRMS] MongoClient connected');
  }
  return global._hrmsClient.db(HRMS_DB);
};

const AVAILABLE_PERMISSIONS = [
  {
    key: 'forms.manage',
    label: 'Manage Forms & Submissions',
    description: 'Create recruitment forms, update workflows, and review submissions.'
  },
  {
    key: 'candidates.manage',
    label: 'Manage Candidates & Decisions',
    description: 'Review candidate profiles, update statuses, and record final decisions.'
  },
  {
    key: 'tests.manage',
    label: 'Manage Tests, Question Bank & Results',
    description: 'Build assessments, assign tests, and publish results.'
  },
  {
    key: 'interviews.manage',
    label: 'Manage Interviews & Feedback',
    description: 'Schedule interviews, assign panels, and analyse feedback.'
  },
  {
    key: 'users.manage',
    label: 'User Management',
    description: 'Manage user accounts, roles, and access control.'
  },
  {
    key: 'panel_members.manage',
    label: 'Panel Members Management',
    description: 'Add, update, and manage interview panel members.'
  }
];

const PERMISSION_KEYS = new Set(AVAILABLE_PERMISSIONS.map(permission => permission.key));

// Normalize permissions - supports both old format (array) and new format (object with access levels)
const normalizePermissions = (permissions = {}) => {
  // If it's an array (old format), convert to object with full_access
  if (Array.isArray(permissions)) {
    const normalized = {};
    permissions.forEach(key => {
      if (PERMISSION_KEYS.has(key)) {
        normalized[key] = 'full_access';
      }
    });
    return normalized;
  }

  // If it's already an object, validate and normalize
  if (typeof permissions === 'object' && permissions !== null) {
    const normalized = {};
    Object.entries(permissions).forEach(([key, value]) => {
      if (PERMISSION_KEYS.has(key)) {
        // Ensure value is either 'view_only' or 'full_access'
        // Support both 'read_only' (legacy) and 'view_only' (new)
        if (value === 'view_only' || value === 'read_only' || value === 'full_access') {
          // Normalize 'read_only' to 'view_only' for consistency
          normalized[key] = value === 'read_only' ? 'view_only' : value;
        } else if (value === true || value === 'true') {
          // Legacy: treat true as full_access
          normalized[key] = 'full_access';
        }
      }
    });
    return normalized;
  }

  return {};
};

// Register new user (only super admin can create panel members and other admins)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    console.log('\n👤 [USER REGISTRATION] Request received from:', req.user.email);
    console.log('👤 [USER REGISTRATION] Request body:', {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      profile: req.body.profile
    });

    const { name, email, password, role, profile, permissions, campus, courses } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.error('❌ [USER REGISTRATION] Missing required fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Only super admin can create panel members and other admins
    if (role === 'super_admin' && req.user.role !== 'super_admin') {
      console.error('❌ [USER REGISTRATION] Unauthorized attempt to create super admin');
      return res.status(403).json({ message: 'Only super admin can create other super admins' });
    }

    if (role === 'sub_admin' && req.user.role !== 'super_admin') {
      console.error('❌ [USER REGISTRATION] Unauthorized attempt to create sub admin');
      return res.status(403).json({ message: 'Only super admin can create sub admins' });
    }

    if (role === 'panel_member') {
      const canManagePanelMembers = hasPermission(req.user, 'panel_members.manage');
      if (!canManagePanelMembers) {
        console.error('❌ [USER REGISTRATION] Unauthorized attempt to create panel member');
        return res.status(403).json({ message: 'Insufficient permissions to create panel members' });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('❌ [USER REGISTRATION] User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Clean profile object - remove empty strings
    const cleanedProfile = profile ? Object.fromEntries(
      Object.entries(profile).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    ) : {};

    console.log('👤 [USER REGISTRATION] Creating user with cleaned profile:', cleanedProfile);

    // Validate courses if provided (for panel members)
    let courseIds = [];
    if (role === 'panel_member' && courses && Array.isArray(courses) && courses.length > 0) {
      // Validate that all course IDs exist and belong to the selected campus
      const validCourses = await Course.find({ 
        _id: { $in: courses },
        campus: campus,
        isActive: true 
      });
      
      if (validCourses.length !== courses.length) {
        return res.status(400).json({ message: 'One or more selected courses are invalid or do not belong to the selected campus' });
      }
      
      courseIds = courses;
      console.log('👤 [USER REGISTRATION] Assigning courses to panel member:', courseIds);
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'candidate',
      campus: (role === 'sub_admin' || role === 'panel_member') ? (campus || undefined) : undefined,
      courses: courseIds.length > 0 ? courseIds : undefined,
      profile: Object.keys(cleanedProfile).length > 0 ? cleanedProfile : undefined,
      permissions: role === 'sub_admin'
        ? normalizePermissions(permissions)
        : undefined
    });

    await user.save();
    console.log('✅ [USER REGISTRATION] User created successfully:', user._id);
    console.log('✅ [USER REGISTRATION] User details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.profile?.designation || 'N/A'
    });

    // Send email notification to panel members with credentials
    if (role === 'panel_member' && password) {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const loginUrl = `${frontendUrl}/login`;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b;">Welcome to Staff Recruitment System</h2>
            <p>Dear ${name},</p>
            <p>Your panel member account has been created successfully. Below are your login credentials:</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">Your Login Credentials</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
              ${user.profile?.designation ? `<p style="margin: 5px 0;"><strong>Designation:</strong> ${user.profile.designation}</p>` : ''}
              ${user.profile?.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${user.profile.phone}</p>` : ''}
            </div>
            <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Portal</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${loginUrl}" style="color: #3b82f6;">${loginUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated message from the Staff Recruitment System. Please do not reply to this email.
            </p>
          </div>
        `;

        const emailText = `
          Welcome to Staff Recruitment System

          Dear ${name},

          Your panel member account has been created successfully. Below are your login credentials:

          Email: ${email}
          Password: ${password}
          ${user.profile?.designation ? `Designation: ${user.profile.designation}` : ''}
          ${user.profile?.phone ? `Phone: ${user.profile.phone}` : ''}

          Important: Please change your password after your first login for security purposes.

          Login URL: ${loginUrl}

          This is an automated message from the Staff Recruitment System. Please do not reply to this email.
        `;

        await sendEmail(email, 'Panel Member Account Created - Staff Recruitment System', emailHtml, emailText);
        console.log('✅ [USER REGISTRATION] Email notification sent to:', email);
      } catch (emailError) {
        console.error('❌ [USER REGISTRATION] Failed to send email notification:', emailError);
        // Don't fail the registration if email fails
      }
    }

    console.log('✅ [USER REGISTRATION] Request completed\n');

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Get available permission options (Super Admin only)
router.get('/permissions', authenticateToken, requireSuperAdmin, (req, res) => {
  res.json({ permissions: AVAILABLE_PERMISSIONS });
});

// Login
// Login (supports Employee ID or Email, validated against SRS and HRMS)
router.post('/login', async (req, res) => {
  try {
    console.log('\n🔐 [LOGIN] Login attempt received');
    const rawIdentifier = (req.body.employeeId || req.body.identifier || req.body.email || req.body.username || '').toString().trim();
    const { password } = req.body;
    console.log('🔐 [LOGIN] Request body:', { identifier: rawIdentifier ? rawIdentifier : 'missing', hasPassword: !!password });

    // Validate input
    if (!rawIdentifier || !password) {
      console.error('❌ [LOGIN] Missing Employee ID/email or password');
      return res.status(400).json({ message: 'Employee ID and password are required' });
    }

    const normalizedEmail = rawIdentifier.toLowerCase();
    console.log('🔐 [LOGIN] Searching for user by employeeId:', rawIdentifier, 'or email:', normalizedEmail);

    // Find user by employeeId (case-insensitive/exact) OR email (case-insensitive)
    let user = await User.findOne({
      $or: [
        { employeeId: rawIdentifier },
        { email: normalizedEmail }
      ]
    });
    
    // If not found in SRS directly, check if this employee exists in HRMS
    if (!user) {
      try {
        const db = await getHrmsDb();
        const hrmsEmp = await db.collection('employees').findOne({
          is_active: true,
          $or: [
            { emp_no: rawIdentifier },
            { email: normalizedEmail }
          ]
        });
        if (hrmsEmp && hrmsEmp.email) {
          user = await User.findOne({ email: hrmsEmp.email.toLowerCase() });
          if (user && !user.employeeId) {
            user.employeeId = hrmsEmp.emp_no;
            await user.save();
          }
        }
      } catch (err) {
        console.warn('⚠️ [LOGIN] HRMS employee lookup error:', err.message);
      }
    }

    if (!user) {
      console.error('❌ [LOGIN] User not found for identifier:', rawIdentifier);
      return res.status(401).json({ message: 'Invalid credentials. Please check your Employee ID / Email or password.' });
    }

    console.log('✅ [LOGIN] User found:', {
      id: user._id,
      name: user.name,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    if (!user.isActive) {
      console.error('❌ [LOGIN] User is inactive:', user.email);
      return res.status(401).json({ message: 'Account is inactive. Please contact administrator.' });
    }

    // Check password
    console.log('🔐 [LOGIN] Verifying credentials...');
    let isPasswordValid = false;

    // 1. If user is linked to HRMS (or identifier matches HRMS), authenticate directly against HRMS
    if (user.employeeId || /^\d+$/.test(rawIdentifier)) {
      try {
        const db = await getHrmsDb();
        const empQuery = {
          is_active: true,
          $or: [
            ...(user.employeeId ? [{ emp_no: user.employeeId }] : []),
            { emp_no: rawIdentifier },
            ...(user.email ? [{ email: user.email.toLowerCase() }] : [])
          ]
        };
        const hrmsUser = await db.collection('employees').findOne(empQuery);
        if (hrmsUser && hrmsUser.password) {
          let hashMatches = false;
          try {
            hashMatches = await bcrypt.compare(password, hrmsUser.password);
          } catch (_) {}

          if (hashMatches) {
            console.log(`✅ [LOGIN] Credentials validated directly against HRMS for ${hrmsUser.employee_name} (${hrmsUser.emp_no})`);
            // Link employeeId if not present, but NEVER store credentials in our database
            if (!user.employeeId && hrmsUser.emp_no) {
              user.employeeId = hrmsUser.emp_no;
              await user.save();
            }
            isPasswordValid = true;
          }
        }
      } catch (hrmsCheckErr) {
        console.warn('⚠️ [LOGIN] Error checking HRMS credentials:', hrmsCheckErr.message);
      }
    }

    // 2. Fallback to local password for non-HRMS users (e.g. super admin or local candidates)
    if (!isPasswordValid && user.password) {
      isPasswordValid = await user.comparePassword(password);
    }

    // If password is still invalid and user is a candidate, check if they entered email as password
    if (!isPasswordValid && user.role === 'candidate') {
      if (password.toLowerCase().trim() === normalizedEmail) {
        user.password = normalizedEmail;
        await user.save();
        isPasswordValid = true;
      }
    }
    
    if (!isPasswordValid) {
      console.error('❌ [LOGIN] Invalid password for user:', rawIdentifier);
      return res.status(401).json({ message: 'Invalid credentials. Please verify your password.' });
    }

    console.log('✅ [LOGIN] Password verified successfully');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    console.log('✅ [LOGIN] Token generated successfully for:', user.name);
    console.log('✅ [LOGIN] User role:', user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        employeeId: user.employeeId || '',
        email: user.email,
        role: user.role,
        campus: user.campus,
        profile: user.profile,
        permissions: user.permissions || [],
        hasPanelMemberAccess: user.hasPanelMemberAccess || false
      }
    });
  } catch (error) {
    console.error('❌ [LOGIN] Login error:', error);
    console.error('❌ [LOGIN] Error stack:', error.stack);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * Handle SSO Login from Central CRM Gateway
 * POST /api/auth/sso-login
 */
router.post('/sso-login', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'SSO token is required'
      });
    }

    const CRM_AUTH_URL = process.env.CRM_AUTH_URL || 'https://crm.pydah.edu.in';
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

    // 1. Verify token with CRM Central Gateway
    let verifyRes;
    try {
      verifyRes = await axios.post(
        `${CRM_AUTH_URL}/api/auth/verify-token`,
        { encryptedToken: token },
        { timeout: 8000 }
      );
    } catch (apiErr) {
      console.error('[SRS-SSO] CRM verify-token failed:', apiErr.response?.data || apiErr.message);
      return res.status(apiErr.response?.status || 401).json({
        success: false,
        message: apiErr.response?.data?.message || 'Invalid or expired SSO token'
      });
    }

    if (!verifyRes.data || !verifyRes.data.valid || !verifyRes.data.data) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized SSO identity'
      });
    }

    const ssoUser = verifyRes.data.data;
    const targetEmail = (ssoUser.email || '').trim().toLowerCase();
    const targetEmpId = ssoUser.employeeId || ssoUser.empNo || null;

    console.log(`[SRS-SSO] Verification successful for: ${ssoUser.name} (${targetEmail || targetEmpId})`);

    // 2. Query SRS User database by email or employeeId
    const queryConditions = [];
    if (targetEmail) queryConditions.push({ email: targetEmail });
    if (targetEmpId) queryConditions.push({ employeeId: targetEmpId });
    if (ssoUser.name) queryConditions.push({ name: ssoUser.name });

    let localUser = null;
    if (queryConditions.length > 0) {
      localUser = await User.findOne({
        $or: queryConditions
      });
    }

    // 3. Auto-provision if user does not exist yet (Staff/HRMS auto-onboarding)
    if (!localUser) {
      if (!targetEmail) {
        return res.status(400).json({
          success: false,
          message: 'Cannot provision user without email'
        });
      }

      console.log(`[SRS-SSO] Auto-provisioning new user: ${targetEmail} (${ssoUser.name})`);

      localUser = new User({
        name: ssoUser.name || ssoUser.username || targetEmail.split('@')[0],
        email: targetEmail,
        employeeId: targetEmpId || undefined,
        role: ssoUser.role && ['super_admin', 'sub_admin', 'panel_member'].includes(ssoUser.role) 
          ? ssoUser.role 
          : 'sub_admin',
        campus: ssoUser.campus || undefined,
        permissions: ssoUser.permissions || {},
        hasPanelMemberAccess: Boolean(ssoUser.hasPanelMemberAccess),
        isActive: true,
        profile: {
          phone: ssoUser.profile?.phone || ssoUser.phone || undefined
        }
      });

      await localUser.save();
    } else {
      // If user exists but employeeId was missing, link it
      if (targetEmpId && !localUser.employeeId) {
        localUser.employeeId = targetEmpId;
        await localUser.save();
      }
    }

    // 4. Verify user is active
    if (!localUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact the recruitment administrator.'
      });
    }

    // 5. Generate local SRS JWT session token (include userId for authenticateToken middleware)
    const localToken = jwt.sign(
      {
        userId: localUser._id,
        id: localUser._id,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        campus: localUser.campus,
        employeeId: localUser.employeeId
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log(`✅ [SRS-SSO] Session established for ${localUser.name} (${localUser.role})`);

    // 6. Return response
    return res.status(200).json({
      success: true,
      token: localToken,
      user: {
        id: localUser._id,
        name: localUser.name,
        email: localUser.email,
        role: localUser.role,
        campus: localUser.campus,
        employeeId: localUser.employeeId || '',
        permissions: localUser.permissions || {},
        hasPanelMemberAccess: Boolean(localUser.hasPanelMemberAccess),
        profile: localUser.profile
      }
    });

  } catch (error) {
    console.error('[SRS-SSO] Error during ssoLogin:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during SSO authentication'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, profile } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, profile },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Get all users (super admin only)
router.get('/users', authenticateToken, requireSuperAdminOrPermission('users.manage'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Update user status (super admin only)
router.put('/users/:userId/status', authenticateToken, requireSuperAdminOrPermission('users.manage'), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

// Update panel member details (super admin only)
router.put('/panel-members/:userId', authenticateToken, requireSuperAdminOrPermission('panel_members.manage'), async (req, res) => {
  try {
    console.log('\n👤 [PANEL MEMBER UPDATE] Request received from:', req.user.email);
    console.log('👤 [PANEL MEMBER UPDATE] User ID:', req.params.userId);
    console.log('👤 [PANEL MEMBER UPDATE] Update data:', {
      name: req.body.name,
      email: req.body.email,
      profile: req.body.profile,
      campus: req.body.campus,
      courses: req.body.courses
    });

    const { name, email, password, profile, campus, courses } = req.body;

    // Clean profile object - remove empty strings
    const cleanedProfile = profile ? Object.fromEntries(
      Object.entries(profile).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    ) : {};

    const updateData = { name, email };
    
    // Handle password update if provided
    if (password && password.trim() !== '') {
      updateData.password = password;
      console.log('👤 [PANEL MEMBER UPDATE] Password will be updated');
    }
    
    if (Object.keys(cleanedProfile).length > 0) {
      updateData.profile = cleanedProfile;
    }

    console.log('👤 [PANEL MEMBER UPDATE] Updating with data:', { ...updateData, password: password ? '***' : 'not provided' });

    // Use findById to get the user, then save to trigger password hashing
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      console.error('❌ [PANEL MEMBER UPDATE] User not found:', req.params.userId);
      return res.status(404).json({ message: 'Panel member not found' });
    }

    // Update fields
    user.name = name;
    user.email = email;
    if (password && password.trim() !== '') {
      user.password = password; // Will be hashed by pre-save hook
    }
    if (Object.keys(cleanedProfile).length > 0) {
      user.profile = cleanedProfile;
    }
    
    // Update campus if provided
    if (campus !== undefined) {
      user.campus = campus || undefined;
    }
    
    // Update courses if provided
    if (courses !== undefined) {
      if (Array.isArray(courses) && courses.length > 0) {
        // Validate that all course IDs exist and belong to the selected campus
        const campusToCheck = campus !== undefined ? campus : user.campus;
        if (campusToCheck) {
          const validCourses = await Course.find({ 
            _id: { $in: courses },
            campus: campusToCheck,
            isActive: true 
          });
          
          if (validCourses.length !== courses.length) {
            return res.status(400).json({ message: 'One or more selected courses are invalid or do not belong to the selected campus' });
          }
          
          user.courses = courses;
          console.log('👤 [PANEL MEMBER UPDATE] Assigning courses:', courses);
        } else {
          return res.status(400).json({ message: 'Campus must be set before assigning courses' });
        }
      } else {
        user.courses = [];
      }
    }

    if (user.role !== 'panel_member') {
      console.error('❌ [PANEL MEMBER UPDATE] User is not a panel member:', user.role);
      return res.status(400).json({ message: 'User is not a panel member' });
    }

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ [PANEL MEMBER UPDATE] Panel member updated successfully:', user._id);
    console.log('✅ [PANEL MEMBER UPDATE] Updated details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      designation: user.profile?.designation || 'N/A'
    });
    console.log('✅ [PANEL MEMBER UPDATE] Request completed\n');

    res.json({
      message: 'Panel member updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Panel member update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error updating panel member' });
  }
});

// Delete panel member (super admin only)
router.delete('/panel-members/:userId', authenticateToken, requireSuperAdminOrPermission('panel_members.manage'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'Panel member not found' });
    }

    if (user.role !== 'panel_member') {
      return res.status(400).json({ message: 'User is not a panel member' });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.json({
      message: 'Panel member deleted successfully'
    });
  } catch (error) {
    console.error('Panel member delete error:', error);
    res.status(500).json({ message: 'Server error deleting panel member' });
  }
});

// Get all panel members (super admin only)
// Includes users with role 'panel_member' OR sub_admins with hasPanelMemberAccess
router.get('/panel-members', authenticateToken, requireSuperAdminOrPermission('panel_members.manage'), async (req, res) => {
  try {
    const panelMembers = await User.find({
      $or: [
        { role: 'panel_member' },
        { role: 'sub_admin', hasPanelMemberAccess: true }
      ]
    })
      .select('-password')
      .populate('courses', 'campus department')
      .sort({ createdAt: -1 });
    res.json({ panelMembers });
  } catch (error) {
    console.error('Panel members fetch error:', error);
    res.status(500).json({ message: 'Server error fetching panel members' });
  }
});

// Sub Admin Management
router.get('/sub-admins', authenticateToken, requireSuperAdminOrPermission('users.manage'), async (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const subAdmins = await User.find({ role: 'sub_admin' })
      .select('-password')
      .populate('courses', 'campus department')
      .sort({ createdAt: -1 });

    res.json({
      subAdmins,
      availablePermissions: AVAILABLE_PERMISSIONS
    });
  } catch (error) {
    console.error('Sub admin fetch error:', error);
    res.status(500).json({ message: 'Server error fetching sub admins' });
  }
});

router.post('/sub-admins', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, employeeId, password, profile, permissions, campus, courses, assignedRoleId, assignedRoleName } = req.body;

    const trimmedEmail = email ? email.toLowerCase().trim() : '';
    let trimmedEmpId = employeeId ? String(employeeId).trim() : null;

    let finalPassword = password ? String(password).trim() : undefined;

    // For non-HRMS sub-admins, password is required
    if (!trimmedEmpId && !finalPassword) {
      return res.status(400).json({ message: 'Password is required for non-HRMS sub-admins' });
    }

    if (!name || !trimmedEmail) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const cleanedProfile = profile ? Object.fromEntries(
      Object.entries(profile).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    ) : {};

    const normalizedPermissions = normalizePermissions(permissions || {});

    // Validate courses if provided (for sub-admins)
    let courseIds = [];
    if (courses && Array.isArray(courses) && courses.length > 0) {
      if (!campus) {
        return res.status(400).json({ message: 'Campus must be set before assigning courses' });
      }
      
      // Validate that all course IDs exist and belong to the selected campus
      const validCourses = await Course.find({ 
        _id: { $in: courses },
        campus: campus,
        isActive: true 
      });
      
      if (validCourses.length !== courses.length) {
        return res.status(400).json({ message: 'One or more selected courses are invalid or do not belong to the selected campus' });
      }
      
      courseIds = courses;
      console.log('👤 [SUB ADMIN CREATION] Assigning courses to sub-admin:', courseIds);
    }

    let finalAssignedRoleId = assignedRoleId || null;
    let finalAssignedRoleName = assignedRoleName || null;
    if (assignedRoleId) {
      const rQuery = mongoose.isValidObjectId(assignedRoleId)
        ? { $or: [{ id: assignedRoleId }, { _id: assignedRoleId }] }
        : { id: assignedRoleId };
      const rDoc = await Role.findOne(rQuery);
      if (rDoc) {
        finalAssignedRoleId = rDoc.id;
        finalAssignedRoleName = rDoc.name;
      }
    }

    const existingUser = await User.findOne({
      $or: [
        { email: trimmedEmail },
        ...(trimmedEmpId ? [{ employeeId: trimmedEmpId }] : [])
      ]
    });
    if (existingUser) {
      existingUser.role = 'sub_admin';
      existingUser.name = name || existingUser.name;
      if (trimmedEmpId) {
        existingUser.employeeId = trimmedEmpId;
        existingUser.password = undefined; // Never store HRMS credentials in SRS DB
      } else if (finalPassword) {
        existingUser.password = finalPassword;
      }
      existingUser.permissions = normalizedPermissions;
      existingUser.campus = campus || undefined;
      existingUser.courses = courseIds.length > 0 ? courseIds : undefined;
      existingUser.hasPanelMemberAccess = req.body.hasPanelMemberAccess === true;
      if (assignedRoleId !== undefined) existingUser.assignedRoleId = finalAssignedRoleId;
      if (assignedRoleName !== undefined) existingUser.assignedRoleName = finalAssignedRoleName;
      if (Object.keys(cleanedProfile).length > 0) existingUser.profile = cleanedProfile;
      await existingUser.save();
      const userResponse = existingUser.toObject();
      delete userResponse.password;
      return res.status(200).json({
        message: 'Sub admin access configured and role assigned successfully',
        subAdmin: userResponse
      });
    }

    const subAdmin = new User({
      name,
      email: trimmedEmail,
      employeeId: trimmedEmpId || undefined,
      password: trimmedEmpId ? undefined : finalPassword,
      role: 'sub_admin',
      campus: campus || undefined,
      courses: courseIds.length > 0 ? courseIds : undefined,
      profile: Object.keys(cleanedProfile).length > 0 ? cleanedProfile : undefined,
      permissions: normalizedPermissions,
      hasPanelMemberAccess: req.body.hasPanelMemberAccess === true,
      assignedRoleId: finalAssignedRoleId,
      assignedRoleName: finalAssignedRoleName
    });

    await subAdmin.save();

    // Send email notification to sub-admin with credentials and permissions
    if (trimmedEmpId || password) {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const loginUrl = `${frontendUrl}/login`;

        // Build permissions list for email
        const permissionsList = Object.entries(normalizedPermissions)
          .map(([key, accessLevel]) => {
            const permission = AVAILABLE_PERMISSIONS.find(p => p.key === key);
            const label = permission ? permission.label : key;
            const accessLabel = accessLevel === 'full_access' ? 'Full Access' : 'View Only';
            return `<li style="margin: 8px 0;"><strong>${label}:</strong> ${accessLabel}</li>`;
          })
          .join('');

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b;">Welcome to Staff Recruitment System</h2>
            <p>Dear ${name},</p>
            <p>Your sub-admin account has been created successfully. Below are your account details:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c;">
              <h3 style="margin: 0 0 15px 0; color: #1e293b;">Your Login Credentials</h3>
              ${trimmedEmpId ? `<p style="margin: 8px 0;"><strong>Employee ID:</strong> ${trimmedEmpId}</p>` : ''}
              <p style="margin: 8px 0;"><strong>Email:</strong> ${trimmedEmail}</p>
              <p style="margin: 8px 0;"><strong>Password:</strong> ${trimmedEmpId ? '<span style="color: #16a34a; font-weight: 600;">Use your existing HRMS portal password</span>' : password}</p>
              <p style="margin: 8px 0;"><strong>Role:</strong> Sub Admin</p>
            </div>

            ${Object.keys(normalizedPermissions).length > 0 ? `
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="margin: 0 0 15px 0; color: #1e293b;">Your Permissions & Access Levels</h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569;">
                ${permissionsList}
              </ul>
            </div>
            ` : `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;"><strong>Note:</strong> No specific permissions have been assigned yet. Please contact the super admin to configure your access.</p>
            </div>
            `}

            ${trimmedEmpId ? `<p><strong>Note:</strong> Your login authentication is securely linked to your HRMS credentials. Sign in with your Employee ID and your existing HRMS password.</p>` : `<p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>`}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Portal</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${loginUrl}" style="color: #3b82f6;">${loginUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated message from the Staff Recruitment System. Please do not reply to this email.
            </p>
          </div>
        `;

        const permissionsText = Object.entries(normalizedPermissions)
          .map(([key, accessLevel]) => {
            const permission = AVAILABLE_PERMISSIONS.find(p => p.key === key);
            const label = permission ? permission.label : key;
            const accessLabel = accessLevel === 'full_access' ? 'Full Access' : 'View Only';
            return `  - ${label}: ${accessLabel}`;
          })
          .join('\n');

        const emailText = `
          Welcome to Staff Recruitment System

          Dear ${name},

          Your sub-admin account has been created successfully. Below are your account details:

          Login Credentials:
          ${trimmedEmpId ? `Employee ID: ${trimmedEmpId}\n          ` : ''}Email: ${trimmedEmail}
          Password: ${trimmedEmpId ? 'Use your existing HRMS portal password' : password}
          Role: Sub Admin

          ${Object.keys(normalizedPermissions).length > 0 ? `Your Permissions & Access Levels:\n${permissionsText}` : 'Note: No specific permissions have been assigned yet. Please contact the super admin to configure your access.'}

          ${trimmedEmpId ? 'Note: Your login authentication is securely linked to your HRMS credentials. Sign in with your Employee ID and your existing HRMS password.' : 'Important: Please change your password after your first login for security purposes.'}

          Login URL: ${loginUrl}

          This is an automated message from the Staff Recruitment System. Please do not reply to this email.
        `;

        await sendEmail(email, 'Sub Admin Account Created - Staff Recruitment System', emailHtml, emailText);
        console.log('✅ [SUB ADMIN CREATION] Email notification sent to:', email);
      } catch (emailError) {
        console.error('❌ [SUB ADMIN CREATION] Failed to send email notification:', emailError);
        // Don't fail the creation if email fails
      }
    }

    const userResponse = subAdmin.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Sub admin created successfully',
      subAdmin: userResponse
    });
  } catch (error) {
    console.error('Sub admin creation error:', error);
    res.status(500).json({ message: 'Server error creating sub admin' });
  }
});

router.put('/sub-admins/:userId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, employeeId, password, profile, permissions, isActive, campus, courses, hasPanelMemberAccess, assignedRoleId, assignedRoleName } = req.body;
    const subAdmin = await User.findById(req.params.userId);

    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub admin not found' });
    }

    if (subAdmin.role !== 'sub_admin') {
      return res.status(400).json({ message: 'User is not a sub admin' });
    }

    if (name !== undefined) subAdmin.name = name;
    if (email !== undefined) subAdmin.email = email.toLowerCase().trim();
    if (employeeId !== undefined) subAdmin.employeeId = employeeId ? String(employeeId).trim() : undefined;
    if (typeof isActive === 'boolean') subAdmin.isActive = isActive;
    if (campus !== undefined) subAdmin.campus = campus || undefined;
    if (typeof hasPanelMemberAccess === 'boolean') subAdmin.hasPanelMemberAccess = hasPanelMemberAccess;
    if (assignedRoleId !== undefined) {
      if (assignedRoleId) {
        const roleQuery = mongoose.isValidObjectId(assignedRoleId)
          ? { $or: [{ id: assignedRoleId }, { _id: assignedRoleId }] }
          : { id: assignedRoleId };
        const roleDoc = await Role.findOne(roleQuery);
        if (roleDoc) {
          subAdmin.assignedRoleId = roleDoc.id;
          subAdmin.assignedRoleName = roleDoc.name;
          if (permissions === undefined) {
            subAdmin.permissions = roleDoc.defaultPermissions;
          }
          if (hasPanelMemberAccess === undefined) {
            subAdmin.hasPanelMemberAccess = Boolean(roleDoc.hasPanelMemberAccess);
          }
        } else {
          subAdmin.assignedRoleId = assignedRoleId;
          if (assignedRoleName !== undefined) {
            subAdmin.assignedRoleName = assignedRoleName || null;
          }
        }
      } else {
        subAdmin.assignedRoleId = null;
        subAdmin.assignedRoleName = null;
      }
    } else if (assignedRoleName !== undefined) {
      subAdmin.assignedRoleName = assignedRoleName || null;
    }

    if (profile !== undefined) {
      const cleanedProfile = profile ? Object.fromEntries(
        Object.entries(profile).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      ) : {};
      subAdmin.profile = Object.keys(cleanedProfile).length > 0 ? cleanedProfile : undefined;
    }

    if (password && password.trim() !== '') {
      subAdmin.password = password.trim();
    } else if (subAdmin.employeeId) {
      // HRMS employee credentials remain managed exclusively in HRMS; do not store in SRS
      subAdmin.password = undefined;
    }

    if (permissions !== undefined) {
      subAdmin.permissions = normalizePermissions(permissions || {});
    }

    // Update courses if provided
    if (courses !== undefined) {
      if (Array.isArray(courses) && courses.length > 0) {
        const campusToCheck = campus !== undefined ? campus : subAdmin.campus;
        if (campusToCheck) {
          // Validate that all course IDs exist and belong to the selected campus
          const validCourses = await Course.find({ 
            _id: { $in: courses },
            campus: campusToCheck,
            isActive: true 
          });
          
          if (validCourses.length !== courses.length) {
            return res.status(400).json({ message: 'One or more selected courses are invalid or do not belong to the selected campus' });
          }
          
          subAdmin.courses = courses;
          console.log('👤 [SUB ADMIN UPDATE] Assigning courses:', courses);
        } else {
          return res.status(400).json({ message: 'Campus must be set before assigning courses' });
        }
      } else {
        subAdmin.courses = [];
      }
    }

    await subAdmin.save();

    const userResponse = subAdmin.toObject();
    delete userResponse.password;

    res.json({
      message: 'Sub admin updated successfully',
      subAdmin: userResponse
    });
  } catch (error) {
    console.error('Sub admin update error:', error);
    res.status(500).json({ message: 'Server error updating sub admin' });
  }
});

router.delete('/sub-admins/:userId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const subAdmin = await User.findById(req.params.userId);

    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub admin not found' });
    }

    if (subAdmin.role !== 'sub_admin') {
      return res.status(400).json({ message: 'User is not a sub admin' });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'Sub admin deleted successfully' });
  } catch (error) {
    console.error('Sub admin delete error:', error);
    res.status(500).json({ message: 'Server error deleting sub admin' });
  }
});

// ─── ROLE CONFIGURATION ENDPOINTS (Super Admin only) ─────────────────────────
router.get('/roles', authenticateToken, requireSuperAdminOrPermission('users.manage'), async (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const roles = await Role.find().sort({ createdAt: 1 });
    const subAdmins = await User.find({ role: 'sub_admin' }, 'assignedRoleId assignedRoleName');

    const rolesWithCounts = roles.map(r => {
      const obj = r.toObject();
      const rId = r.id;
      const rDbId = r._id ? String(r._id) : null;
      const rName = r.name ? r.name.toLowerCase() : '';

      const count = subAdmins.filter(u =>
        u.assignedRoleId === rId ||
        (rDbId && u.assignedRoleId === rDbId) ||
        (u.assignedRoleName && u.assignedRoleName.toLowerCase() === rName)
      ).length;

      obj.assignedUsersCount = count;
      return obj;
    });

    res.json({ roles: rolesWithCounts });
  } catch (error) {
    console.error('Fetch roles error:', error);
    res.status(500).json({ message: 'Server error fetching roles' });
  }
});

router.post('/roles', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id, name, badge, icon, color, bgColor, description, defaultPermissions, hasPanelMemberAccess, userIds } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    const roleId = id || `role_${Date.now()}`;
    const normalizedPermissions = normalizePermissions(defaultPermissions || {});
    const permissionCount = Object.keys(normalizedPermissions).length;

    let role = await Role.findOne({ id: roleId });
    if (role) {
      role.name = name.trim();
      role.badge = badge || role.badge;
      role.icon = icon || role.icon;
      role.color = color || role.color;
      role.bgColor = bgColor || role.bgColor;
      role.description = description !== undefined ? description : role.description;
      role.defaultPermissions = normalizedPermissions;
      role.hasPanelMemberAccess = Boolean(hasPanelMemberAccess);
      role.permissionCount = permissionCount;
      await role.save();
    } else {
      role = new Role({
        id: roleId,
        name: name.trim(),
        badge: badge || 'Custom',
        icon: icon || '🛡️',
        color: color || '#0284c7',
        bgColor: bgColor || '#f0f9ff',
        description: description || '',
        defaultPermissions: normalizedPermissions,
        hasPanelMemberAccess: Boolean(hasPanelMemberAccess),
        permissionCount
      });
      await role.save();
    }

    if (Array.isArray(userIds) && userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: userIds }, role: 'sub_admin' },
        {
          $set: {
            permissions: normalizedPermissions,
            hasPanelMemberAccess: Boolean(hasPanelMemberAccess),
            assignedRoleId: roleId,
            assignedRoleName: role.name
          }
        }
      );
    }

    const roleObj = role.toObject();
    roleObj.assignedUsersCount = Array.isArray(userIds) ? userIds.length : 0;

    res.status(201).json({ role: roleObj, message: 'Role created successfully' });
  } catch (error) {
    console.error('Save role error:', error);
    res.status(500).json({ message: 'Server error saving role' });
  }
});

router.put('/roles/:roleId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, badge, icon, color, bgColor, description, defaultPermissions, hasPanelMemberAccess, userIds } = req.body;

    const normalizedPermissions = normalizePermissions(defaultPermissions || {});
    const permissionCount = Object.keys(normalizedPermissions).length;

    const query = mongoose.isValidObjectId(roleId)
      ? { $or: [{ id: roleId }, { _id: roleId }] }
      : { id: roleId };

    let role = await Role.findOne(query);
    if (!role) {
      role = new Role({
        id: roleId,
        name: name ? name.trim() : 'Custom Role',
        badge: badge || 'Custom',
        icon: icon || '🛡️',
        color: color || '#0284c7',
        bgColor: bgColor || '#f0f9ff',
        description: description || '',
        defaultPermissions: normalizedPermissions,
        hasPanelMemberAccess: Boolean(hasPanelMemberAccess),
        permissionCount
      });
    } else {
      if (name) role.name = name.trim();
      if (badge !== undefined) role.badge = badge;
      if (icon !== undefined) role.icon = icon;
      if (color !== undefined) role.color = color;
      if (bgColor !== undefined) role.bgColor = bgColor;
      if (description !== undefined) role.description = description;
      role.defaultPermissions = normalizedPermissions;
      role.hasPanelMemberAccess = Boolean(hasPanelMemberAccess);
      role.permissionCount = permissionCount;
    }

    await role.save();

    // If explicit userIds are supplied, assign them and detach unselected ones
    if (Array.isArray(userIds)) {
      const validObjectIds = userIds.map(id => mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : id);
      if (userIds.length > 0) {
        await User.updateMany(
          { _id: { $in: validObjectIds }, role: 'sub_admin' },
          {
            $set: {
              assignedRoleId: role.id,
              assignedRoleName: role.name,
              permissions: normalizedPermissions,
              hasPanelMemberAccess: Boolean(hasPanelMemberAccess)
            }
          }
        );
      }
      await User.updateMany(
        {
          role: 'sub_admin',
          $or: [
            { assignedRoleId: role.id },
            ...(role._id ? [{ assignedRoleId: String(role._id) }] : [])
          ],
          _id: { $nin: validObjectIds }
        },
        {
          $set: {
            assignedRoleId: null,
            assignedRoleName: null
          }
        }
      );
    }

    // Immediately synchronize updated permissions & panel access to ALL assigned users
    const syncQuery = {
      role: 'sub_admin',
      $or: [
        { assignedRoleId: role.id },
        ...(role._id ? [{ assignedRoleId: String(role._id) }] : []),
        { assignedRoleName: role.name }
      ]
    };

    const syncResult = await User.updateMany(syncQuery, {
      $set: {
        permissions: normalizedPermissions,
        hasPanelMemberAccess: Boolean(hasPanelMemberAccess),
        assignedRoleId: role.id,
        assignedRoleName: role.name
      }
    });

    console.log(`✅ [ROLE SYNC] Updated role "${role.name}" (${role.id}). Synced ${syncResult.modifiedCount} assigned user(s) with ${permissionCount} permissions.`);

    res.json({
      role,
      updatedUsersCount: syncResult.modifiedCount,
      message: `Role "${role.name}" updated successfully. Synced ${syncResult.modifiedCount} user(s).`
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error updating role: ' + error.message });
  }
});

router.delete('/roles/:roleId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { roleId } = req.params;
    const { reassignToRoleId } = req.body || {};

    const findQuery = mongoose.isValidObjectId(roleId)
      ? { $or: [{ id: roleId }, { _id: roleId }] }
      : { id: roleId };

    const roleToDelete = await Role.findOne(findQuery);

    // Idempotent: If role was already deleted, still clean up any lingering assignedRoleId references and return 200
    if (!roleToDelete) {
      await User.updateMany(
        { role: 'sub_admin', assignedRoleId: roleId },
        { $set: { assignedRoleId: null, assignedRoleName: null } }
      );
      return res.json({ message: 'Role deleted successfully or was already removed.', reassignedCount: 0 });
    }

    const actualId = roleToDelete.id;
    const actualDbId = roleToDelete._id ? String(roleToDelete._id) : null;
    const userMatchQuery = {
      role: 'sub_admin',
      $or: [
        { assignedRoleId: actualId },
        ...(actualDbId ? [{ assignedRoleId: actualDbId }] : []),
        { assignedRoleName: roleToDelete.name }
      ]
    };

    let reassignedCount = 0;
    let message = `Role "${roleToDelete.name}" deleted successfully.`;

    if (reassignToRoleId && reassignToRoleId !== 'custom') {
      const targetQuery = mongoose.isValidObjectId(reassignToRoleId)
        ? { $or: [{ id: reassignToRoleId }, { _id: reassignToRoleId }] }
        : { id: reassignToRoleId };
      const targetRole = await Role.findOne(targetQuery);
      if (targetRole) {
        const updateRes = await User.updateMany(userMatchQuery, {
          $set: {
            assignedRoleId: targetRole.id,
            assignedRoleName: targetRole.name,
            permissions: targetRole.defaultPermissions,
            hasPanelMemberAccess: Boolean(targetRole.hasPanelMemberAccess)
          }
        });
        reassignedCount = updateRes.modifiedCount;
        message = `Role "${roleToDelete.name}" deleted. Reassigned ${reassignedCount} user(s) to "${targetRole.name}".`;
      }
    } else {
      // Detach users from deleted role without revoking their existing permissions (convert to custom standalone access)
      const updateRes = await User.updateMany(userMatchQuery, {
        $set: { assignedRoleId: null, assignedRoleName: null }
      });
      reassignedCount = updateRes.modifiedCount;
      if (reassignedCount > 0) {
        message = `Role "${roleToDelete.name}" deleted. Converted ${reassignedCount} user(s) to custom standalone access.`;
      }
    }

    await Role.deleteMany(findQuery);

    res.json({ message, reassignedCount });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ message: 'Server error deleting role: ' + error.message });
  }
});

// ─── HRMS Employee Search ───────────────────────────────────────────────────
// Uses native MongoClient for a reliable secondary DB connection to HRMS
router.get('/hrms/search-employees', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const searchTerm = q.trim();
    const db = await getHrmsDb();

    // Match emp_no exactly (numeric) OR employee_name case-insensitive
    const isNumeric = /^\d+$/.test(searchTerm);
    const searchQuery = {
      is_active: true,
      $or: [
        ...(isNumeric ? [{ emp_no: searchTerm }] : []),
        { employee_name: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const rawEmployees = await db.collection('employees').find(searchQuery).limit(20).toArray();

    if (rawEmployees.length === 0) {
      return res.json({ employees: [] });
    }

    // Batch-lookup referenced division / department / designation names
    const toObjId = (id) => { try { return new ObjectId(String(id)); } catch (_) { return null; } };
    const divIds   = [...new Set(rawEmployees.map(e => e.division_id).filter(Boolean))].map(toObjId).filter(Boolean);
    const deptIds  = [...new Set(rawEmployees.map(e => e.department_id).filter(Boolean))].map(toObjId).filter(Boolean);
    const desigIds = [...new Set(rawEmployees.map(e => e.designation_id).filter(Boolean))].map(toObjId).filter(Boolean);

    const [divisions, departments, designations] = await Promise.all([
      divIds.length   ? db.collection('divisions').find({ _id: { $in: divIds } }).toArray()    : [],
      deptIds.length  ? db.collection('departments').find({ _id: { $in: deptIds } }).toArray() : [],
      desigIds.length ? db.collection('designations').find({ _id: { $in: desigIds } }).toArray() : []
    ]);

    const divMap   = Object.fromEntries(divisions.map(d  => [d._id.toString(), d.name]));
    const deptMap  = Object.fromEntries(departments.map(d => [d._id.toString(), d.name]));
    const desigMap = Object.fromEntries(designations.map(d => [d._id.toString(), d.name]));

    const employees = rawEmployees.map(e => ({
      _id:            e._id.toString(),
      emp_no:         e.emp_no        || '',
      employee_name:  e.employee_name || '',
      email:          e.email         || '',
      phone_number:   e.phone_number  || '',
      division:       e.division_id   ? (divMap[String(e.division_id)]   || '') : '',
      department:     e.department_id ? (deptMap[String(e.department_id)]  || '') : '',
      designation:    e.designation_id ? (desigMap[String(e.designation_id)] || '') : '',
      hasHrmsAuth:    Boolean(e.password || e.plain_password),
      is_active:      e.is_active
    }));

    res.json({ employees });

  } catch (error) {
    console.error('❌ [HRMS] Employee search error:', error.message);
    if (global._hrmsClient) {
      try { await global._hrmsClient.close(); } catch (_) {}
      global._hrmsClient = null;
    }
    res.status(500).json({ message: 'Failed to search HRMS employees: ' + error.message });
  }
});

module.exports = router;
