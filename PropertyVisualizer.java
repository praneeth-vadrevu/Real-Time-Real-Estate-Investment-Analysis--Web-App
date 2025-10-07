import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.swing.*;
import javax.swing.border.TitledBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.text.NumberFormat;
import java.util.Locale;
import java.nio.file.Files;

public class PropertyVisualizer extends JFrame {
    private JTextArea dataDisplay;
    private JLabel propertyInfo;
    private JLabel priceInfo;
    private JLabel locationInfo;
    private JComboBox<String> fileSelector;
    private JsonNode currentData;
    private ObjectMapper mapper;
    private NumberFormat currencyFormat;
    
    public PropertyVisualizer() {
        super("Zillow Property Data Visualizer");
        mapper = new ObjectMapper();
        currencyFormat = NumberFormat.getCurrencyInstance(Locale.US);
        
        initializeComponents();
        setupLayout();
        loadAvailableFiles();
        
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1000, 700);
        setLocationRelativeTo(null);
    }
    
    private void initializeComponents() {
        // File selector
        fileSelector = new JComboBox<>();
        fileSelector.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                loadSelectedFile();
            }
        });
        
        // Property information panel
        propertyInfo = new JLabel("Please select a JSON file");
        propertyInfo.setFont(new Font("Arial", Font.BOLD, 16));
        propertyInfo.setHorizontalAlignment(SwingConstants.CENTER);
        
        priceInfo = new JLabel("");
        priceInfo.setFont(new Font("Arial", Font.PLAIN, 14));
        priceInfo.setForeground(Color.BLUE);
        
        locationInfo = new JLabel("");
        locationInfo.setFont(new Font("Arial", Font.PLAIN, 12));
        locationInfo.setForeground(Color.GRAY);
        
        // Data display area
        dataDisplay = new JTextArea(20, 50);
        dataDisplay.setFont(new Font("Consolas", Font.PLAIN, 12));
        dataDisplay.setEditable(false);
        dataDisplay.setBackground(Color.WHITE);
        
        JScrollPane scrollPane = new JScrollPane(dataDisplay);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED);
        
        // Button panel
        JButton refreshButton = new JButton("Refresh File List");
        refreshButton.addActionListener(e -> loadAvailableFiles());
        
        JButton exportButton = new JButton("Export to HTML");
        exportButton.addActionListener(e -> exportToHTML());
        
        JPanel buttonPanel = new JPanel(new FlowLayout());
        buttonPanel.add(refreshButton);
        buttonPanel.add(exportButton);
    }
    
    private void setupLayout() {
        setLayout(new BorderLayout());
        
        // Top panel
        JPanel topPanel = new JPanel(new BorderLayout());
        topPanel.setBorder(new TitledBorder("File Selection"));
        
        JPanel filePanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        filePanel.add(new JLabel("Select JSON file: "));
        filePanel.add(fileSelector);
        topPanel.add(filePanel, BorderLayout.CENTER);
        
        JButton refreshButton = new JButton("Refresh");
        refreshButton.addActionListener(e -> loadAvailableFiles());
        topPanel.add(refreshButton, BorderLayout.EAST);
        
        // Information panel
        JPanel infoPanel = new JPanel(new BorderLayout());
        infoPanel.setBorder(new TitledBorder("Property Information"));
        infoPanel.add(propertyInfo, BorderLayout.NORTH);
        infoPanel.add(priceInfo, BorderLayout.CENTER);
        infoPanel.add(locationInfo, BorderLayout.SOUTH);
        
        // Data panel
        JPanel dataPanel = new JPanel(new BorderLayout());
        dataPanel.setBorder(new TitledBorder("Detailed Data"));
        JScrollPane scrollPane = new JScrollPane(dataDisplay);
        dataPanel.add(scrollPane, BorderLayout.CENTER);
        
        // Bottom buttons
        JPanel bottomPanel = new JPanel(new FlowLayout());
        JButton exportButton = new JButton("Export to HTML");
        exportButton.addActionListener(e -> exportToHTML());
        bottomPanel.add(exportButton);
        
        // Assemble interface
        add(topPanel, BorderLayout.NORTH);
        add(infoPanel, BorderLayout.CENTER);
        add(dataPanel, BorderLayout.SOUTH);
        add(bottomPanel, BorderLayout.PAGE_END);
    }
    
    private void loadAvailableFiles() {
        File outputDir = new File("output");
        if (!outputDir.exists()) {
            dataDisplay.setText("Output directory does not exist, please run ZillowMiniApp first to generate data");
            return;
        }
        
        File[] files = outputDir.listFiles((dir, name) -> name.endsWith(".json"));
        if (files == null || files.length == 0) {
            dataDisplay.setText("No JSON files found in output directory");
            return;
        }
        
        fileSelector.removeAllItems();
        for (File file : files) {
            fileSelector.addItem(file.getName());
        }
        
        dataDisplay.setText("Found " + files.length + " JSON files, please select a file to view");
    }
    
    private void loadSelectedFile() {
        String selectedFile = (String) fileSelector.getSelectedItem();
        if (selectedFile == null || selectedFile.equals("No JSON files found")) {
            return;
        }
        
        try {
            File file = new File("output", selectedFile);
            currentData = mapper.readTree(file);
            displayPropertyData();
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this, "Failed to load file: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void displayPropertyData() {
        // Prioritize using standardized PropertyDetailMin data
        if (currentData.has("detailMin")) {
            displayPropertyDetailMin(currentData.get("detailMin"));
        } else if (currentData.has("detail")) {
            displayPropertyDetailRaw(currentData.get("detail"));
        } else {
            displayRawData();
        }
    }
    
    private void displayPropertyDetailMin(JsonNode detailMin) {
        // Display detailed data
        StringBuilder sb = new StringBuilder();
        sb.append("=== Property Detailed Information ===\n\n");
        
        // Basic information
        String address = extractValue(detailMin, "address", "Unknown Address");
        String homeType = extractValue(detailMin, "homeType", "Unknown");
        Double price = extractValueAsDouble(detailMin, "price");
        Double zestimate = extractValueAsDouble(detailMin, "zestimate");
        Double rentEstimate = extractValueAsDouble(detailMin, "rentEstimate");
        Double bedrooms = extractValueAsDouble(detailMin, "beds");
        Double bathrooms = extractValueAsDouble(detailMin, "baths");
        Double livingArea = extractValueAsDouble(detailMin, "livingArea");
        Integer yearBuilt = extractValueAsInteger(detailMin, "yearBuilt");
        
        // Update display
        propertyInfo.setText(address);
        StringBuilder priceText = new StringBuilder();
        if (price != null) {
            priceText.append("Price: ").append(currencyFormat.format(price));
        }
        if (zestimate != null) {
            priceText.append(" | Zestimate: ").append(currencyFormat.format(zestimate));
        }
        if (rentEstimate != null) {
            priceText.append(" | Rent Estimate: ").append(currencyFormat.format(rentEstimate));
        }
        priceInfo.setText(priceText.toString());
        
        StringBuilder specText = new StringBuilder();
        if (bedrooms != null && bedrooms > 0) specText.append(bedrooms.intValue()).append(" bed");
        if (bathrooms != null && bathrooms > 0) specText.append(" ").append(bathrooms.intValue()).append(" bath");
        if (livingArea != null && livingArea > 0) specText.append(" ").append(livingArea.intValue()).append(" sqft");
        if (yearBuilt != null && yearBuilt > 0) specText.append(" ").append(yearBuilt).append(" built");
        locationInfo.setText(specText.toString());
        
        // Extract basic information
        String address2 = extractValue(currentData, "detail.streetAddress", "Unknown Address");
        String city = extractValue(currentData, "detail.city", "Unknown");
        String state = extractValue(currentData, "detail.state", "Unknown");
        String zipcode = extractValue(currentData, "detail.zipcode", "Unknown");
        String county = extractValue(currentData, "detail.county", "Unknown");
        
        // Price information
        String price2 = extractValue(currentData, "detail.price", "0");
        String zestimate2 = extractValue(currentData, "detail.zestimate", "0");
        String rentEstimate2 = extractValue(currentData, "detail.rentEstimate", "0");
        
        // Property specifications
        String bedrooms2 = extractValue(currentData, "detail.bedrooms", "0");
        String bathrooms2 = extractValue(currentData, "detail.bathrooms", "0");
        String livingArea2 = extractValue(currentData, "detail.livingArea", "0");
        String lotArea = extractValue(currentData, "detail.lotAreaValue", "0");
        String lotAreaUnit = extractValue(currentData, "detail.lotAreaUnit", "sqft");
        String propertyType = extractValue(currentData, "detail.propertyType", "Unknown");
        String listingStatus = extractValue(currentData, "detail.listingStatus", "Unknown");
        
        // Update display
        propertyInfo.setText(address2);
        StringBuilder priceText2 = new StringBuilder();
        if (!price2.equals("0")) {
            priceText2.append("Price: ").append(currencyFormat.format(Long.parseLong(price2)));
        }
        if (!zestimate2.equals("0")) {
            priceText2.append(" | Zestimate: ").append(currencyFormat.format(Long.parseLong(zestimate2)));
        }
        if (!rentEstimate2.equals("0")) {
            priceText2.append(" | Rent Estimate: ").append(currencyFormat.format(Long.parseLong(rentEstimate2)));
        }
        priceInfo.setText(priceText2.toString());
        
        StringBuilder specText2 = new StringBuilder();
        if (!bedrooms2.equals("0")) specText2.append(bedrooms2).append(" bed");
        if (!bathrooms2.equals("0")) specText2.append(" ").append(bathrooms2).append(" bath");
        if (!livingArea2.equals("0")) specText2.append(" ").append(livingArea2).append(" sqft");
        if (!lotArea.equals("0")) specText2.append(" ").append(lotArea).append(" ").append(lotAreaUnit);
        locationInfo.setText(specText2.toString());
        
        sb.append("=== Property Detailed Information ===\n\n");
        
        // Basic information
        sb.append("【Basic Information】\n");
        sb.append("Address: ").append(extractValue(currentData, "detail.streetAddress", "Unknown")).append("\n");
        sb.append("City: ").append(extractValue(currentData, "detail.city", "Unknown")).append("\n");
        sb.append("State: ").append(extractValue(currentData, "detail.state", "Unknown")).append("\n");
        sb.append("ZIP Code: ").append(extractValue(currentData, "detail.zipcode", "Unknown")).append("\n");
        sb.append("County: ").append(extractValue(currentData, "detail.county", "Unknown")).append("\n\n");
        
        // Price information
        sb.append("【Price Information】\n");
        String price3 = extractValue(currentData, "detail.price", "0");
        String zestimate3 = extractValue(currentData, "detail.zestimate", "0");
        String rentEstimate3 = extractValue(currentData, "detail.rentEstimate", "0");
        
        if (!price3.equals("0")) {
            sb.append("Price: ").append(currencyFormat.format(Long.parseLong(price3))).append("\n");
        }
        if (!zestimate3.equals("0")) {
            sb.append("Zillow Estimate: ").append(currencyFormat.format(Long.parseLong(zestimate3))).append("\n");
        }
        if (!rentEstimate3.equals("0")) {
            sb.append("Rent Estimate: ").append(currencyFormat.format(Long.parseLong(rentEstimate3))).append("\n");
        }
        sb.append("\n");
        
        // Property specifications
        sb.append("【Property Specifications】\n");
        sb.append("Bedrooms: ").append(extractValue(currentData, "detail.bedrooms", "0")).append("\n");
        sb.append("Bathrooms: ").append(extractValue(currentData, "detail.bathrooms", "0")).append("\n");
        sb.append("Living Area: ").append(extractValue(currentData, "detail.livingArea", "0")).append(" sqft\n");
        sb.append("Lot Area: ").append(extractValue(currentData, "detail.lotAreaValue", "0")).append(" ").append(extractValue(currentData, "detail.lotAreaUnit", "sqft")).append("\n");
        sb.append("Property Type: ").append(extractValue(currentData, "detail.propertyType", "Unknown")).append("\n");
        sb.append("Listing Status: ").append(extractValue(currentData, "detail.listingStatus", "Unknown")).append("\n\n");
        
        // Tax information
        if (currentData.has("tax") && currentData.get("tax").has("taxHistory")) {
            sb.append("【Tax History】\n");
            JsonNode taxHistory = currentData.get("tax").get("taxHistory");
            if (taxHistory.isArray()) {
                for (JsonNode tax : taxHistory) {
                    String year = extractValue(tax, "taxYear", "Unknown");
                    String value = extractValue(tax, "value", "0");
                    String taxPaid = extractValue(tax, "taxPaid", "0");
                    
                    if (!year.equals("Unknown") && !value.equals("0")) {
                        try {
                            int yearInt = Integer.parseInt(year);
                            sb.append(yearInt).append(": Property Value ").append(currencyFormat.format(Long.parseLong(value)))
                              .append(", Tax Paid ").append(currencyFormat.format(Double.parseDouble(taxPaid))).append("\n");
                        } catch (NumberFormatException e) {
                            // Skip invalid entries
                        }
                    }
                }
            }
            sb.append("\n");
        }
        
        // Image information
        if (currentData.has("images")) {
            sb.append("【Image Information】\n");
            JsonNode images = currentData.get("images");
            if (images.isArray()) {
                sb.append("Number of Images: ").append(images.size()).append("\n");
                for (int i = 0; i < Math.min(images.size(), 5); i++) {
                    String url = extractValue(images.get(i), "url", "");
                    if (!url.isEmpty()) {
                        sb.append("Image ").append(i + 1).append(": ").append(url).append("\n");
                    }
                }
            }
            sb.append("\n");
        }
        
        // Raw JSON data
        sb.append("【Raw JSON Data】\n");
        try {
            String jsonString = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(currentData);
            sb.append(jsonString);
        } catch (Exception e) {
            sb.append("Unable to format JSON data: ").append(e.getMessage());
        }
        
        dataDisplay.setText(sb.toString());
    }
    
    private void displayPropertyDetailRaw(JsonNode detail) {
        // Similar implementation for raw detail data
        displayRawData();
    }
    
    private void displayRawData() {
        StringBuilder sb = new StringBuilder();
        sb.append("=== Raw Property Data ===\n\n");
        
        try {
            String jsonString = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(currentData);
            sb.append(jsonString);
        } catch (Exception e) {
            sb.append("Unable to format JSON data: ").append(e.getMessage());
        }
        
        dataDisplay.setText(sb.toString());
    }
    
    private String extractValue(JsonNode node, String path, String defaultValue) {
        String[] keys = path.split("\\.");
        JsonNode current = node;
        
        for (String key : keys) {
            if (current == null || !current.has(key)) {
                return defaultValue;
            }
            current = current.get(key);
        }
        
        return current.isTextual() ? current.asText() : current.toString();
    }
    
    private Double extractValueAsDouble(JsonNode node, String key) {
        if (node == null || !node.has(key)) return null;
        JsonNode value = node.get(key);
        return value.isNumber() ? value.asDouble() : null;
    }
    
    private Integer extractValueAsInteger(JsonNode node, String key) {
        if (node == null || !node.has(key)) return null;
        JsonNode value = node.get(key);
        return value.isNumber() ? value.asInt() : null;
    }
    
    private void exportToHTML() {
        if (currentData == null) {
            JOptionPane.showMessageDialog(this, "Please select a JSON file first", "Info", JOptionPane.INFORMATION_MESSAGE);
            return;
        }
        
        try {
            File outputFile = new File("property_data_export.html");
            StringBuilder html = new StringBuilder();
            
            html.append("<!DOCTYPE html>\n");
            html.append("<html>\n");
            html.append("<head>\n");
            html.append("    <meta charset='UTF-8'>\n");
            html.append("    <title>Property Data Visualization</title>\n");
            html.append("    <style>\n");
            html.append("        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }\n");
            html.append("        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n");
            html.append("        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }\n");
            html.append("        h2 { color: #34495e; margin-top: 30px; }\n");
            html.append("        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }\n");
            html.append("        .info-card { background: #ecf0f1; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db; }\n");
            html.append("        .price-info { background: #e8f5e8; border-left-color: #27ae60; }\n");
            html.append("        .spec-item { text-align: center; padding: 10px; background: #f8f9fa; margin: 5px; border-radius: 5px; }\n");
            html.append("        .spec-item strong { display: block; font-size: 1.5em; color: #2c3e50; }\n");
            html.append("        pre { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; overflow-x: auto; }\n");
            html.append("    </style>\n");
            html.append("</head>\n");
            html.append("<body>\n");
            html.append("    <div class='container'>\n");
            html.append("            <h1>🏠 Property Data Visualization</h1>\n");
            html.append("            <p>Property information display based on Zillow API</p>\n");
            html.append("        </div>\n");
            
            // Property basic information
            String address = extractValue(currentData, "detail.streetAddress", "Unknown Address");
            String city = extractValue(currentData, "detail.city", "Unknown");
            String state = extractValue(currentData, "detail.state", "Unknown");
            String zipcode = extractValue(currentData, "detail.zipcode", "Unknown");
            
            html.append("        <div class='info-grid'>\n");
            html.append("            <div class='info-card'>\n");
            html.append("                <h3>📍 Address</h3>\n");
            html.append("                <p><strong>").append(address).append("</strong></p>\n");
            html.append("                <p>").append(city).append(", ").append(state).append(" ").append(zipcode).append("</p>\n");
            html.append("            </div>\n");
            
            // Price information
            String price = extractValue(currentData, "detail.price", "0");
            String zestimate = extractValue(currentData, "detail.zestimate", "0");
            String rentEstimate = extractValue(currentData, "detail.rentEstimate", "0");
            
            html.append("            <div class='info-card price-info'>\n");
            html.append("                <h3>💰 Price Information</h3>\n");
            if (!price.equals("0")) {
                html.append("                <span>Price: ").append(currencyFormat.format(Long.parseLong(price))).append("</span>\n");
            }
            if (!zestimate.equals("0")) {
                html.append("                <span style='margin-left: 20px;'>Zestimate: ").append(currencyFormat.format(Long.parseLong(zestimate))).append("</span>\n");
            }
            if (!rentEstimate.equals("0")) {
                html.append("                <span style='margin-left: 20px;'>Rent Estimate: ").append(currencyFormat.format(Long.parseLong(rentEstimate))).append("</span>\n");
            }
            html.append("            </div>\n");
            
            // Property specifications
            String bedrooms = extractValue(currentData, "detail.bedrooms", "0");
            String bathrooms = extractValue(currentData, "detail.bathrooms", "0");
            String livingArea = extractValue(currentData, "detail.livingArea", "0");
            
            html.append("            <div class='info-card'>\n");
            html.append("                <h3>🏠 Property Specifications</h3>\n");
            if (!bedrooms.equals("0")) {
                html.append("                <div class='spec-item'><strong>").append(bedrooms).append("</strong><br>Bedrooms</div>\n");
            }
            if (!bathrooms.equals("0")) {
                html.append("                <div class='spec-item'><strong>").append(bathrooms).append("</strong><br>Bathrooms</div>\n");
            }
            if (!livingArea.equals("0")) {
                html.append("                <div class='spec-item'><strong>").append(livingArea).append("</strong><br>Square Feet</div>\n");
            }
            html.append("            </div>\n");
            html.append("        </div>\n");
            
            // Detailed data
            html.append("        <div class='info-card'>\n");
            html.append("            <h3>📊 Detailed Data</h3>\n");
            try {
                String jsonString = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(currentData);
                html.append("                <pre>").append(jsonString).append("</pre>\n");
            } catch (Exception e) {
                html.append("                <pre>Unable to format JSON data: ").append(e.getMessage()).append("</pre>\n");
            }
            html.append("        </div>\n");
            html.append("    </div>\n");
            html.append("</body>\n");
            html.append("</html>\n");
            
            Files.write(outputFile.toPath(), html.toString().getBytes());
            JOptionPane.showMessageDialog(this, "HTML file exported to: " + outputFile.getAbsolutePath(), "Export Successful", JOptionPane.INFORMATION_MESSAGE);
            
            // Try to open in browser
            if (Desktop.isDesktopSupported()) {
                Desktop.getDesktop().browse(outputFile.toURI());
            }
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this, "Export failed: " + e.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new PropertyVisualizer().setVisible(true);
        });
    }
}