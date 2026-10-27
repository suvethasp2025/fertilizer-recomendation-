export const generatePDF = (prediction, userName = 'Farmer') => {
  if (!prediction) return;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  const dateStr = new Date(prediction.timestamp).toLocaleDateString();
  const timeStr = new Date(prediction.timestamp).toLocaleTimeString();
  const inputs = prediction.inputs || {};
  const explanation = prediction.explanation || {};
  
  // Format items
  const advantagesList = (explanation.advantages || []).map(adv => `<li>${adv}</li>`).join('');
  const organicList = (explanation.organic_alternatives || []).map(org => `<li>${org}</li>`).join('');
  const safetyList = (explanation.safety_tips || []).map(safe => `<li>${safe}</li>`).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Fertilizer Recommendation Report - ${prediction.recommended_fertilizer}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            background-color: #fff;
          }
          .header {
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 35px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header h1 {
            color: #065f46;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 14px;
          }
          .section-title {
            color: #047857;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 25px;
          }
          .card {
            background-color: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 8px;
            padding: 15px 20px;
          }
          .card h3 {
            margin-top: 0;
            color: #4b5563;
            font-size: 14px;
            text-transform: uppercase;
          }
          .metric-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .metric {
            text-align: center;
            padding: 10px;
            background-color: #fff;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          .metric-value {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
          }
          .metric-label {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
          }
          .result-box {
            background-color: #ecfdf5;
            border: 1.5px solid #a7f3d0;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin-bottom: 30px;
          }
          .result-title {
            color: #065f46;
            font-size: 16px;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .result-value {
            font-size: 36px;
            font-weight: 800;
            color: #10b981;
            margin: 0;
            letter-spacing: 1px;
          }
          .result-confidence {
            font-size: 14px;
            color: #047857;
            margin-top: 5px;
            margin-bottom: 0;
          }
          ul {
            padding-left: 20px;
            margin-top: 5px;
          }
          li {
            margin-bottom: 8px;
          }
          .footer {
            margin-top: 60px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          }
          @media print {
            body {
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Smart Fertilizer Recommendation</h1>
            <p>Generated for ${userName} on ${dateStr} at ${timeStr}</p>
          </div>
          <div style="text-align: right">
            <span style="background-color: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">OFFICIAL AGRO-REPORT</span>
          </div>
        </div>

        <div class="result-box">
          <p class="result-title">Recommended Fertilizer</p>
          <h2 class="result-value">${prediction.recommended_fertilizer}</h2>
          <p class="result-confidence">Recommendation Confidence: <strong>${(prediction.confidence * 100).toFixed(1)}%</strong></p>
        </div>

        <div class="section-title">Soil & Climatic Parameters</div>
        <div class="grid">
          <div class="card">
            <h3>Soil Composition</h3>
            <div class="metric-grid">
              <div class="metric">
                <div class="metric-value">${inputs.Nitrogen}</div>
                <div class="metric-label">Nitrogen (N)</div>
              </div>
              <div class="metric">
                <div class="metric-value">${inputs.Phosphorous}</div>
                <div class="metric-label">Phosphorus (P)</div>
              </div>
              <div class="metric">
                <div class="metric-value">${inputs.Potassium}</div>
                <div class="metric-label">Potassium (K)</div>
              </div>
            </div>
            <p style="font-size: 13px; color:#4b5563; margin-top: 15px; margin-bottom:0;">
              Soil Type: <strong>${inputs['Soil Type']}</strong><br/>
              Target Crop: <strong>${inputs['Crop Type']}</strong>
            </p>
          </div>
          
          <div class="card">
            <h3>Environmental Parameters</h3>
            <div class="metric-grid">
              <div class="metric">
                <div class="metric-value">${inputs.Temperature}°C</div>
                <div class="metric-label">Temperature</div>
              </div>
              <div class="metric">
                <div class="metric-value">${inputs.Humidity}%</div>
                <div class="metric-label">Humidity</div>
              </div>
              <div class="metric">
                <div class="metric-value">${inputs.Moisture}%</div>
                <div class="metric-label">Soil Moisture</div>
              </div>
            </div>
            <p style="font-size: 13px; color:#4b5563; margin-top: 15px; margin-bottom:0;">
              NPK Ratio of Fertilizer: <strong>${explanation.npk_ratio || 'N/A'}</strong>
            </p>
          </div>
        </div>

        <div class="section-title">Why this fertilizer?</div>
        <p>${explanation.why_this || 'Based on your soil and environmental metrics, this fertilizer provides the optimal nutrients for your crop development.'}</p>

        <div class="section-title">Application Details</div>
        <p><strong>Method:</strong> ${explanation.application_method || 'Follow standard manual application directions.'}</p>
        
        <div class="grid">
          <div>
            <div class="section-title" style="margin-top: 10px;">Key Advantages</div>
            <ul>${advantagesList || '<li>Provides targeted crop nutrition</li>'}</ul>
          </div>
          <div>
            <div class="section-title" style="margin-top: 10px;">Organic Alternatives</div>
            <ul>${organicList || '<li>Natural animal manure</li><li>Organic compost</li>'}</ul>
          </div>
        </div>

        <div class="section-title">Handling & Safety Tips</div>
        <ul>${safetyList || '<li>Wear protective gloves and masks</li><li>Store in dry sealed conditions</li>'}</ul>

        <div class="footer">
          <p>Smart Fertilizer Recommendation System &copy; ${new Date().getFullYear()}. All Rights Reserved.</p>
          <p style="font-size: 10px;">This recommendation is based on a machine learning classification model. Check regional field rules before applying.</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
