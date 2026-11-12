const bcrypt = require('bcryptjs');
const { readData, writeData, generateId } = require('../config/db');

class UserModel {
  constructor(data) {
    Object.assign(this, data);
  }

  async matchPassword(enteredPassword) {
    if (!this.password) {
      const data = readData();
      const rawUser = data.users.find((u) => u._id === this._id);
      if (rawUser && rawUser.password) {
        return bcrypt.compare(enteredPassword, rawUser.password);
      }
      return false;
    }
    return bcrypt.compare(enteredPassword, this.password);
  }

  static async findOne(query) {
    const data = readData();
    let found = null;

    if (query.email) {
      const emailLower = query.email.toLowerCase().trim();
      found = data.users.find(
        (u) => u.email && u.email.toLowerCase() === emailLower
      );
    } else if (query._id) {
      found = data.users.find((u) => u._id && u._id === query._id);
    }

    if (!found) return null;
    const userInstance = new UserModel(found);
    return userInstance;
  }

  static async findById(id) {
    if (!id) return null;
    const data = readData();
    const found = data.users.find(
      (u) => u._id && u._id.toString() === id.toString()
    );
    if (!found) return null;

    const userCopy = { ...found };
    delete userCopy.password;
    return new UserModel(userCopy);
  }

  static async create({ name, email, password }) {
    const data = readData();
    const emailLower = email.toLowerCase().trim();

    // Check duplicate
    const exists = data.users.some(
      (u) => u.email && u.email.toLowerCase() === emailLower
    );
    if (exists) {
      const err = new Error('An account with this email already exists');
      err.code = 11000;
      throw err;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const now = new Date().toISOString();
    const newUser = {
      _id: generateId(),
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    data.users.push(newUser);
    writeData(data);

    const userCopy = { ...newUser };
    delete userCopy.password;
    return new UserModel(userCopy);
  }

  static async deleteMany() {
    const data = readData();
    data.users = [];
    writeData(data);
    return { deletedCount: 0 };
  }
}

module.exports = UserModel;
