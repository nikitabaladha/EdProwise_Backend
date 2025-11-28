import express from 'express';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    // All website routes (static + placeholders for dynamic routes)
    const links = [
      // Root & pages
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/about-us', changefreq: 'monthly', priority: 0.8 },
      { url: '/contact-us', changefreq: 'monthly', priority: 0.8 },
      { url: '/order', changefreq: 'monthly', priority: 0.8 },

      // Services (parent and children)
      { url: '/services', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-fees-management', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-payroll', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-financial-management', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-operation-management', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-mobile-application', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-website-design', changefreq: 'monthly', priority: 0.8 },

      { url: '/services/academic-admin-services', changefreq: 'monthly', priority: 0.8 },
      // note: AppRoutes used both "hire-teacher" and "recruitment-services"
      { url: '/services/hire-teacher', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/recruitment-services', changefreq: 'monthly', priority: 0.8 },
      // procurement / goods
      { url: '/services/get-goods-for-school', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/get-goods-services', changefreq: 'monthly', priority: 0.8 },

      // Community / blog
      { url: '/community-connect', changefreq: 'monthly', priority: 0.8 },
      { url: '/community-connect/gallery', changefreq: 'monthly', priority: 0.8 },
      { url: '/community-connect/edprowise-talks', changefreq: 'monthly', priority: 0.8 },
      { url: '/community-connect/student-zone', changefreq: 'monthly', priority: 0.8 },
      { url: '/community-connect/educator-zone', changefreq: 'monthly', priority: 0.8 },

      // Community blog detail + category placeholders
      { url: '/community-connect/student-zone/proposed-exam-reforms-by-cbse', changefreq: 'monthly', priority: 0.8 },
      { url: '/community-connect/student-zone/how-to-be-successful-in-the-cbse-board-exam', changefreq: 'monthly', priority: 0.8 },
      { url: '/community-connect/educator-zone/how-to-be-successful-teacher', changefreq: 'monthly', priority: 0.8 },
      { url: '/community-connect/educator-zone/teaching-strategies-and-pedagogy', changefreq: 'monthly', priority: 0.8 },
      { url: '/community-connect/educator-zone/teacher-well-being-and-work-life-balance', changefreq: 'monthly', priority: 0.8 },

      // dynamic blog routes (placeholders)
      { url: '/community-connect/student-zone/{slug}', changefreq: 'monthly', priority: 0.7 },
      { url: '/community-connect/educator-zone/{slug}', changefreq: 'monthly', priority: 0.7 },
      { url: '/community-connect/student-zone/category-tag-related-blogs', changefreq: 'monthly', priority: 0.7 },
      { url: '/community-connect/educator-zone/category-tag-related-blogs', changefreq: 'monthly', priority: 0.7 },

      // Website misc pages
      { url: '/become-supplier', changefreq: 'monthly', priority: 0.7 },
      { url: '/faq', changefreq: 'monthly', priority: 0.7 },
      { url: '/privacy-policy', changefreq: 'monthly', priority: 0.6 },
      { url: '/terms', changefreq: 'monthly', priority: 0.6 },
      { url: '/career', changefreq: 'monthly', priority: 0.7 },
      { url: '/career/{jobName}', changefreq: 'monthly', priority: 0.6 },
      { url: '/request-demo', changefreq: 'monthly', priority: 0.7 },
      { url: '/terms-condition-for-seller', changefreq: 'monthly', priority: 0.6 },

      // pages duplicated in second website section (kept for compatibility)
      { url: '/change-school-admin-password', changefreq: 'monthly', priority: 0.5 },

      // Payroll / Employee service pages exposed on website shell (examples found in AppRoutes)
      { url: '/payroll-module/employee-services/update-details', changefreq: 'monthly', priority: 0.5 },
      { url: '/payroll-module/employee-services/attendance/mark-attendance', changefreq: 'monthly', priority: 0.5 },
      { url: '/payroll-module/employee-services/attendance/apply-for-leave', changefreq: 'monthly', priority: 0.5 },
      { url: '/payroll-module/employee-services/attendance/my-attendance-report', changefreq: 'monthly', priority: 0.5 },

      // smaller / example website routes that are referenced
      { url: '/order', changefreq: 'monthly', priority: 0.6 },

      // Also include the legacy example blog pages already in your existing sitemap
      { url: '/community-connect/student-zone/proposed-exam-reforms-by-cbse', changefreq: 'monthly', priority: 0.8 },
      { url: '/community-connect/student-zone/how-to-be-successful-in-the-cbse-board-exam', changefreq: 'monthly', priority: 0.8 },

      // Additional site sections referenced in the AppRoutes website area (kept for SEO coverage)
      { url: '/services/digital-services/school-fees-management', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-payroll', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-financial-management', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-operation-management', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-mobile-application', changefreq: 'monthly', priority: 0.8 },
      { url: '/services/digital-services/school-website-design', changefreq: 'monthly', priority: 0.8 },

      // Any additional static website pages you may add later can be appended here
    ];

    // Create sitemap
    const stream = new SitemapStream({ hostname: process.env.FRONTEND_URL || 'https://edprowise.com' });

    res.setHeader('Content-Type', 'application/xml');
    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    res.send(xml.toString());
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).end();
  }
});

export default router;
