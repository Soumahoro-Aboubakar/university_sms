// ============================================
// SERVEUR NODE.JS - PLATEFORME SMS UNIVERSITAIRE
// ============================================

// Installation des dépendances nécessaires :
// npm install express mongoose bcryptjs jsonwebtoken cors dotenv axios twilio
// npm install --save-dev nodemon

import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import twilio from 'twilio';


dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Pour servir le frontend React

// ============================================
// CONFIGURATION BASE DE DONNÉES
// ============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university_sms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// ============================================
// MODÈLES DE DONNÉES
// ============================================

// Schéma Étudiant
const studentSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  level: { type: String, enum: ['L1', 'L2', 'L3', 'M1', 'M2'], required: true },
  specialization: { 
    type: String, 
    enum: ['Mathématique', 'Informatique', null],
    default: null
  },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// Schéma Enseignant
const teacherSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  grade: { 
    type: String, 
    enum: ['Professeur', 'Maître de Conférences', 'Assistant', 'Chargé de Cours', 'Doctorant'],
    required: true 
  },
  specialization: { 
    type: String, 
    enum: ['Mathématique', 'Informatique'],
    required: true 
  },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Teacher = mongoose.model('Teacher', teacherSchema);

// Schéma Administrateur
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Schéma Historique SMS
const smsHistorySchema = new mongoose.Schema({
  message: { type: String, required: true },
  recipients: [{
    name: String,
    phone: String,
    type: String,
    ip: String
  }],
  sentBy: { type: String, required: true },
  recipientCount: { type: Number, required: true },
  status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'sent' },
  createdAt: { type: Date, default: Date.now }
});

const SMSHistory = mongoose.model('SMSHistory', smsHistorySchema);

// ============================================
// MIDDLEWARE D'AUTHENTIFICATION
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_in_production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Middleware pour admin uniquement
const authenticateAdmin = (req, res, next) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};

// ============================================
// SERVICE SMS (Intégration avec API SMS)
// ============================================


/*
export async function sendSMS(phone, message) {
  try {
    // 📌 OPTION 1 : Utiliser Twilio si les identifiants sont disponibles
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });

      return { success: true, method: 'twilio', messageId: result.sid };
    }
  } catch (error) {
    console.error('Erreur envoi SMS:', error);
    return { success: false, error: error.message };
  }
}  */


async function sendSMS(phone, message) {
  const url = `${process.env.INFOBIP_BASE_URL}/sms/2/text/advanced`;

  const data = {
    messages: [
      {
        from: "447491163443",
        destinations: [{ to: phone }],
        text: message
      }
    ]
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("Message envoyé :", response.data);
  } catch (error) {
    console.error("Erreur en envoyant le SMS :", error.response ? error.response.data : error.message);
  }
}

// ============================================
// ROUTES AUTHENTIFICATION
// ============================================

// Inscription Étudiant
app.post('/api/auth/signup/student', async (req, res) => {
  try {
    const { ip, phone, level, specialization } = req.body;

    // Vérifier si l'IP existe déjà
    const existingStudent = await Student.findOne({ ip });
    if (existingStudent) {
      return res.status(400).json({ error: 'Cet identifiant permanent existe déjà' });
    }

    // Créer le nouvel étudiant
    const student = new Student({
      ip,
      phone,
      level,
      specialization: (level === 'L1' || level === 'L2') ? null : specialization,
      firstName: '',
      lastName: '',
      profileComplete: false
    });

    await student.save();

    res.status(201).json({ 
      message: 'Inscription réussie',
      studentId: student._id
    });
  } catch (error) {
    console.error('Erreur inscription étudiant:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Inscription Enseignant
app.post('/api/auth/signup/teacher', async (req, res) => {
  try {
    const { ip, phone, grade, specialization } = req.body;

    const existingTeacher = await Teacher.findOne({ ip });
    if (existingTeacher) {
      return res.status(400).json({ error: 'Cet identifiant permanent existe déjà' });
    }

    const teacher = new Teacher({
      ip,
      phone,
      grade,
      specialization,
      firstName: '',
      lastName: '',
      profileComplete: false
    });

    await teacher.save();

    res.status(201).json({ 
      message: 'Inscription réussie',
      teacherId: teacher._id
    });
  } catch (error) {
    console.error('Erreur inscription enseignant:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, passwordOrPhone, userType } = req.body;

    let user;
    let token;

    if (userType === 'admin') {
      // Connexion admin
      user = await Admin.findOne({ email: identifier });
      if (!user) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }

      const isPasswordValid = await bcrypt.compare(passwordOrPhone, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }

      token = jwt.sign(
        { id: user._id, type: 'admin', email: user.email },
        process.env.JWT_SECRET || 'secret_key_change_in_production',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          type: 'admin'
        }
      });
    } 
    else if (userType === 'student') {
      // Connexion étudiant
      user = await Student.findOne({ ip: identifier, phone: passwordOrPhone });
      if (!user) {
        return res.status(401).json({ error: 'Identifiants incorrects. Vérifiez votre IP et votre numéro de téléphone' });
      }

      token = jwt.sign(
        { id: user._id, type: 'student', ip: user.ip },
        process.env.JWT_SECRET || 'secret_key_change_in_production',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          ip: user.ip,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          level: user.level,
          specialization: user.specialization,
          profileComplete: user.profileComplete,
          type: 'student'
        }
      });
    }
    else if (userType === 'teacher') {
      // Connexion enseignant
      user = await Teacher.findOne({ ip: identifier, phone: passwordOrPhone });
      if (!user) {
        return res.status(401).json({ error: 'Identifiants incorrects. Vérifiez votre IP et votre numéro de téléphone' });
      }

      token = jwt.sign(
        { id: user._id, type: 'teacher', ip: user.ip },
        process.env.JWT_SECRET || 'secret_key_change_in_production',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          ip: user.ip,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          grade: user.grade,
          specialization: user.specialization,
          profileComplete: user.profileComplete,
          type: 'teacher'
        }
      });
    }
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// ============================================
// ROUTES PROFIL
// ============================================

// Mettre à jour profil étudiant
app.put('/api/profile/student', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, level, specialization } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { 
        firstName, 
        lastName, 
        phone, 
        level, 
        specialization,
        profileComplete: !!(firstName && lastName)
      },
      { new: true }
    );

    res.json({ 
      message: 'Profil mis à jour',
      user: student
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Mettre à jour profil enseignant
app.put('/api/profile/teacher', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, grade, specialization } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      req.user.id,
      { 
        firstName, 
        lastName, 
        phone, 
        grade, 
        specialization,
        profileComplete: !!(firstName && lastName)
      },
      { new: true }
    );

    res.json({ 
      message: 'Profil mis à jour',
      user: teacher
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// ============================================
// ROUTES ADMINISTRATION
// ============================================

// Obtenir tous les étudiants
app.get('/api/admin/students', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const students = await Student.find().sort({ level: 1, lastName: 1 });
    res.json(students);
  } catch (error) {
    console.error('Erreur récupération étudiants:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// Obtenir tous les enseignants
app.get('/api/admin/teachers', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ lastName: 1 });
    res.json(teachers);
  } catch (error) {
    console.error('Erreur récupération enseignants:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// Obtenir les statistiques
app.get('/api/admin/statistics', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const smsCount = await SMSHistory.countDocuments();

    const studentsByLevel = await Student.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);

    const studentsBySpecialization = await Student.aggregate([
      { $match: { specialization: { $ne: null } } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } }
    ]);

    res.json({
      studentCount,
      teacherCount,
      smsCount,
      studentsByLevel,
      studentsBySpecialization
    });
  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// ============================================
// ROUTES SMS
// ============================================

// Envoyer un SMS
app.post('/api/sms/send', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { message, selectedUserIds } = req.body;

    if (!message || !selectedUserIds || selectedUserIds.length === 0) {
      return res.status(400).json({ error: 'Message et destinataires requis' });
    }

    // Récupérer les destinataires
    const students = await Student.find({ _id: { $in: selectedUserIds.filter(id => id.type === 'student').map(id => id.id) } });
    const teachers = await Teacher.find({ _id: { $in: selectedUserIds.filter(id => id.type === 'teacher').map(id => id.id) } });

    const recipients = [
      ...students.map(s => ({ 
        name: `${s.firstName} ${s.lastName}`, 
        phone: s.phone, 
        type: 'student',
        ip: s.ip 
      })),
      ...teachers.map(t => ({ 
        name: `${t.firstName} ${t.lastName}`, 
        phone: t.phone, 
        type: 'teacher',
        ip: t.ip 
      }))
    ];

    // Envoyer les SMS
    const sendPromises = recipients.map(recipient => 
      sendSMS(recipient.phone, message)
    );

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    // Enregistrer dans l'historique
    const smsHistory = new SMSHistory({
      message,
      recipients,
      sentBy: req.user.email,
      recipientCount: recipients.length,
      status: successCount === recipients.length ? 'sent' : (successCount > 0 ? 'sent' : 'failed')
    });

    await smsHistory.save();

    res.json({
      message: 'SMS envoyés',
      successCount,
      totalCount: recipients.length,
      historyId: smsHistory._id
    });
  } catch (error) {
    console.error('Erreur envoi SMS:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi des SMS' });
  }
});

// Obtenir l'historique des SMS
app.get('/api/sms/history', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const history = await SMSHistory.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(history);
  } catch (error) {
    console.error('Erreur historique SMS:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// ============================================
// INITIALISATION ADMIN PAR DÉFAUT
// ============================================
async function initializeDefaultAdmin() {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@univ.ci' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        email: 'admin@univ.ci',
        password: hashedPassword,
        name: 'Administrateur'
      });
      await admin.save();
      console.log('✅ Administrateur par défaut créé');
      console.log('📧 Email: admin@univ.ci');
      console.log('🔐 Mot de passe: admin123');
    }
  } catch (error) {
    console.error('Erreur initialisation admin:', error);
  }
}

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  await initializeDefaultAdmin();
  console.log(`🌐 API disponible sur http://localhost:${PORT}`);
});

// ============================================
// GESTION DES ERREURS GLOBALES
// ============================================
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée:', err);
  process.exit(1);
});