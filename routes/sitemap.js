import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const links = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/about-us", changefreq: "monthly", priority: 0.8 },
      { url: "/contact-us", changefreq: "monthly", priority: 0.8 },
      { url: "/order", changefreq: "monthly", priority: 0.8 },
      {
        url: "/services/digital-services",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/services/academic-admin-services",
        changefreq: "monthly",
        priority: 0.8,
      },
      { url: "/services/hire-teacher", changefreq: "monthly", priority: 0.8 },
      {
        url: "/services/get-goods-for-school",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/services/digital-services/school-fees-management",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/services/digital-services/school-payroll",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/services/digital-services/school-financial-management",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/services/digital-services/school-operation-management",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/services/digital-services/school-mobile-application",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/services/digital-services/school-website-design",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/community-connect/gallery",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/community-connect/edprowise-talks",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/community-connect/student-zone",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/community-connect/educator-zone",
        changefreq: "monthly",
        priority: 0.8,
      },
      { url: "/faq", changefreq: "monthly", priority: 0.8 },
      { url: "/privacy-policy", changefreq: "monthly", priority: 0.8 },
      { url: "/terms", changefreq: "monthly", priority: 0.8 },
      { url: "/career", changefreq: "monthly", priority: 0.8 },
      { url: "/request-demo", changefreq: "monthly", priority: 0.8 },
      {
        url: "/community-connect/student-zone/proposed-exam-reforms-by-cbse",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/community-connect/student-zone/how-to-be-successful-in-the-cbse-board-exam",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/community-connect/educator-zone/how-to-be-successful-teacher",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/community-connect/educator-zone/teaching-strategies-and-pedagogy",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        url: "/community-connect/educator-zone/teacher-well-being-and-work-life-balance",
        changefreq: "monthly",
        priority: 0.8,
      },
    ];

    const stream = new SitemapStream({ hostname: process.env.FRONTEND_URL });

    res.setHeader("Content-Type", "application/xml");
    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    res.send(xml.toString());
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).end();
  }
});

export default router;
