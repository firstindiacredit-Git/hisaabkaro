<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:template match="/">
    <html>
      <head>
        <title>XML Sitemap - Hisaab करो</title>
        <link rel="icon" href="./favicon.png" type="image/png" />
        <link rel="icon" href="moz-icon://favicon.png" type="image/png" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #4f46e5;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th {
            background: #4f46e5;
            color: white;
            padding: 12px;
            text-align: left;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          tr:hover {
            background: #f5f5f5;
          }
          a {
            color: #4f46e5;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .meta {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap - Hisaab करो</h1>
        <div class="meta">
          <p>This is the XML sitemap for Hisaab करो, which is used to inform search engines about pages on our site that are available for crawling.</p>
          <p>Learn more about <a href="https://www.sitemaps.org/protocol.html">XML Sitemaps</a>.</p>
        </div>
        <table>
          <tr>
            <th>URL</th>
            <th>Last Modified</th>
            <th>Change Frequency</th>
            <th>Priority</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
              <td><xsl:value-of select="sitemap:lastmod"/></td>
              <td><xsl:value-of select="sitemap:changefreq"/></td>
              <td><xsl:value-of select="sitemap:priority"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
