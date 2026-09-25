// controllers/generateController.js
const PDFDocument = require('pdfkit');
const { pool } = require('../config/database'); // Correction ici

exports.generatePDF = async (req, res) => {
  let client; // Nous allons utiliser un client dédié pour cette transaction
  
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Acquérir un client depuis le pool
    client = await pool.connect();
    
    // Récupérer toutes les données de l'utilisateur
    const personalInfoResult = await client.query(
      'SELECT * FROM personal_infos WHERE user_id = $1', 
      [userId]
    );
    
    const experiencesResult = await client.query(
      'SELECT * FROM experiences WHERE user_id = $1 ORDER BY start_date DESC', 
      [userId]
    );
    
    const educationsResult = await client.query(
      'SELECT * FROM educations WHERE user_id = $1 ORDER BY start_date DESC', 
      [userId]
    );
    
    const skillsResult = await client.query(
      'SELECT * FROM skills WHERE user_id = $1 ORDER BY category, skill_name', 
      [userId]
    );
    
    const personalInfo = personalInfoResult.rows[0] || {};
    const experiences = experiencesResult.rows;
    const educations = educationsResult.rows;
    const skills = skillsResult.rows;
    
    // Créer le document PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurer les en-têtes de réponse
    res.setHeader('Content-Disposition', 'attachment; filename="mon_cv.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    
    // Pipe le PDF dans la réponse
    doc.pipe(res);
    
    // Styles réutilisables
    const titleStyle = { fontSize: 16, bold: true, color: '#2c3e50' };
    const subtitleStyle = { fontSize: 14, bold: true, color: '#34495e' };
    
    // En-tête du CV
    if (personalInfo.full_name) {
      doc.fontSize(20).font('Helvetica-Bold').text(personalInfo.full_name.toUpperCase(), { align: 'center' });
      doc.moveDown(0.5);
    }
    
    // Informations de contact
    if (personalInfo.email || personalInfo.phone || personalInfo.address) {
      doc.fontSize(10).font('Helvetica');
      let contactInfo = [];
      if (personalInfo.email) contactInfo.push(personalInfo.email);
      if (personalInfo.phone) contactInfo.push(personalInfo.phone);
      if (personalInfo.address) contactInfo.push(personalInfo.address);
      if (personalInfo.linkedin_url) contactInfo.push(`LinkedIn: ${personalInfo.linkedin_url}`);
      if (personalInfo.github_url) contactInfo.push(`GitHub: ${personalInfo.github_url}`);
      
      doc.text(contactInfo.join(' | '), { align: 'center' });
      doc.moveDown();
    }
    
    // Ligne séparatrice
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#bdc3c7').stroke();
    doc.moveDown();
    
    // Résumé professionnel
    if (personalInfo.summary) {
      doc.fontSize(12).font('Helvetica-Bold').text('PROFIL PROFESSIONNEL', { continued: false });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text(personalInfo.summary, { align: 'justify' });
      doc.moveDown();
    }
    
    // Expériences professionnelles
    if (experiences.length > 0) {
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('EXPÉRIENCES PROFESSIONNELLES', { underline: true });
      doc.moveDown();
      
      experiences.forEach((exp, index) => {
        if (index > 0) doc.moveDown();
        
        // Poste et entreprise
        doc.fontSize(12).font('Helvetica-Bold').text(exp.job_title);
        doc.fontSize(11).font('Helvetica-Bold').text(exp.company);
        
        // Dates et lieu
        const startDate = new Date(exp.start_date).toLocaleDateString('fr-FR');
        const endDate = exp.current_job ? 'Présent' : new Date(exp.end_date).toLocaleDateString('fr-FR');
        let dateLocation = `${startDate} - ${endDate}`;
        if (exp.location) dateLocation += ` | ${exp.location}`;
        
        doc.fontSize(10).font('Helvetica-Oblique').text(dateLocation);
        doc.moveDown(0.3);
        
        // Description
        if (exp.description) {
          doc.fontSize(10).font('Helvetica').text(exp.description, { align: 'justify' });
        }
      });
    }
    
    // Formations
    if (educations.length > 0) {
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('FORMATIONS', { underline: true });
      doc.moveDown();
      
      educations.forEach((edu, index) => {
        if (index > 0) doc.moveDown();
        
        // Diplôme et établissement
        doc.fontSize(12).font('Helvetica-Bold').text(edu.degree);
        doc.fontSize(11).font('Helvetica-Bold').text(edu.institution);
        
        // Dates et lieu
        const startDate = new Date(edu.start_date).toLocaleDateString('fr-FR');
        const endDate = edu.current_education ? 'Présent' : new Date(edu.end_date).toLocaleDateString('fr-FR');
        let dateLocation = `${startDate} - ${endDate}`;
        if (edu.location) dateLocation += ` | ${edu.location}`;
        
        doc.fontSize(10).font('Helvetica-Oblique').text(dateLocation);
        doc.moveDown(0.3);
        
        // Description
        if (edu.description) {
          doc.fontSize(10).font('Helvetica').text(edu.description, { align: 'justify' });
        }
      });
    }
    
    // Compétences
    if (skills.length > 0) {
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('COMPÉTENCES', { underline: true });
      doc.moveDown();
      
      // Grouper les compétences par catégorie
      const skillsByCategory = {};
      skills.forEach(skill => {
        if (!skillsByCategory[skill.category]) {
          skillsByCategory[skill.category] = [];
        }
        skillsByCategory[skill.category].push(skill);
      });
      
      // Afficher les compétences par catégorie
      Object.keys(skillsByCategory).forEach(category => {
        doc.fontSize(12).font('Helvetica-Bold').text(category.toUpperCase());
        doc.moveDown(0.3);
        
        skillsByCategory[category].forEach(skill => {
          // Créer une représentation visuelle du niveau de compétence
          const proficiencyDots = '●'.repeat(skill.proficiency) + '○'.repeat(5 - skill.proficiency);
          doc.fontSize(10).font('Helvetica').text(`• ${skill.skill_name}: ${proficiencyDots}`);
        });
        
        doc.moveDown();
      });
    }
    
    // Pied de page avec numéro de page
    const addPageNumbers = () => {
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).text(`Page ${i + 1} sur ${pages.count}`, 50, doc.page.height - 30, {
          align: 'center',
          width: doc.page.width - 100
        });
      }
    };
    
    addPageNumbers();
    
    // Finaliser le PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  } finally {
    // Toujours libérer le client
    if (client) {
      client.release();
    }
  }
};