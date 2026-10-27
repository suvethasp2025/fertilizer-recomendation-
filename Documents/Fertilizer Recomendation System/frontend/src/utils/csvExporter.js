export const exportToCSV = (data, filename = 'prediction_history.csv') => {
  if (!data || !data.length) {
    return;
  }
  
  // Define CSV headers
  const headers = [
    'Date',
    'Recommended Fertilizer',
    'Confidence (%)',
    'Soil Type',
    'Crop Type',
    'Nitrogen (N)',
    'Phosphorous (P)',
    'Potassium (K)',
    'Temperature (°C)',
    'Humidity (%)',
    'Moisture (%)'
  ];
  
  // Map rows
  const rows = data.map(item => {
    const inputs = item.inputs || {};
    return [
      new Date(item.timestamp).toLocaleDateString(),
      item.recommended_fertilizer,
      (item.confidence * 100).toFixed(1),
      inputs['Soil Type'] || '',
      inputs['Crop Type'] || '',
      inputs.Nitrogen || 0,
      inputs.Phosphorous || 0,
      inputs.Potassium || 0,
      inputs.Temperature || 0,
      inputs.Humidity || 0,
      inputs.Moisture || 0
    ];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => {
      // Escape commas and double quotes
      const cleanVal = String(val).replace(/"/g, '""');
      return `"${cleanVal}"`;
    }).join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
