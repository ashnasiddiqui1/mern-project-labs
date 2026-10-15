import bcrypt from 'bcrypt';
import Customer from '../models/customer.model.js';
import { createCustomerToken } from '../utils/authToken.js';

export async function handleCustomerRegistration(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        error: 'Password must contain at least 6 characters'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingAccount = await Customer.findOne({ email: normalizedEmail });

    if (existingAccount) {
      return res.status(409).json({
        error: 'Email already exists'
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newCustomer = await Customer.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password: passwordHash,
      phone: String(phone).trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone
      }
    });
  } catch (registrationError) {
    if (registrationError.code === 11000) {
      return res.status(409).json({
        error: 'Email already exists'
      });
    }

    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export async function handleCustomerLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const customerAccount = await Customer.findOne({ email: normalizedEmail });

    if (!customerAccount) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, customerAccount.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const sessionJwt = createCustomerToken(customerAccount._id);

    res.cookie('token', sessionJwt, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: {
        _id: customerAccount._id,
        fullName: customerAccount.fullName,
        email: customerAccount.email,
        phone: customerAccount.phone
      }
    });
  } catch (loginError) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export async function fetchCustomerProfile(req, res) {
  try {
    const user = req.user;
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone
    });
  } catch (profileError) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export function handleCustomerLogout(req, res) {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}
