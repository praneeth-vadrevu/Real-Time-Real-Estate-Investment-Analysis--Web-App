import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Optional;
import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ZillowMiniApp {
  public static void main(String[] args) throws Exception {
    API api = new API();
    ObjectMapper mapper = new ObjectMapper();
    
    // Create output directory
    File outputDir = new File("output");
    if (!outputDir.exists()) {
      outputDir.mkdirs();
    }

    // 1) Extended search (example: for sale)
    String location = Optional.ofNullable(System.getenv("DEMO_LOCATION")).orElse("Santa Monica, CA");
    System.out.println("Searching for properties: " + location);
    JsonNode search = api.propertyExtendedSearch(location, "for_sale", 1);
    
    // Save search results
    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
    File searchFile = new File(outputDir, "search_" + timestamp + ".json");
    mapper.writerWithDefaultPrettyPrinter().writeValue(searchFile, search);
    System.out.println("Search results saved to: " + searchFile.getAbsolutePath());

    // 2) Use new SearchCard functionality to get property information
    List<API.SearchCard> cards = api.toSearchCards(search);
    System.out.println("Found " + cards.size() + " properties");
    
    if (cards.isEmpty()) {
      System.out.println("No properties found, please check search criteria");
      return;
    }
    
    // Display basic information for first few properties
    for (int i = 0; i < Math.min(3, cards.size()); i++) {
      API.SearchCard card = cards.get(i);
      System.out.println("Property " + (i+1) + ": " + card);
    }
    
    String zpid = cards.get(0).zpid;
    System.out.println("Selected first property for detailed analysis, ID: " + zpid);

    // 3) Property details
    System.out.println("Getting property details...");
    JsonNode detail = api.propertyDetail(zpid);
    File detailFile = new File(outputDir, "detail_" + zpid + "_" + timestamp + ".json");
    mapper.writerWithDefaultPrettyPrinter().writeValue(detailFile, detail);
    System.out.println("Property details saved to: " + detailFile.getAbsolutePath());
    
    // Use new PropertyDetailMin functionality to get standardized data
    API.PropertyDetailMin detailMin = api.toDetailMin(detail);
    System.out.println("Standardized property details: " + detailMin);
    
    // Save standardized data
    File detailMinFile = new File(outputDir, "detail_min_" + zpid + "_" + timestamp + ".json");
    mapper.writerWithDefaultPrettyPrinter().writeValue(detailMinFile, mapper.valueToTree(detailMin));
    System.out.println("Standardized property details saved to: " + detailMinFile.getAbsolutePath());

    // 4) Additional: Tax/Images/Estimates/Rent/Comparables (optional)
    System.out.println("Getting additional information...");
    JsonNode tax = null, imgs = null, zest = null, rent = null, comps = null;
    
    try {
      tax = api.priceAndTaxHistory(zpid);
      File taxFile = new File(outputDir, "tax_" + zpid + "_" + timestamp + ".json");
      mapper.writerWithDefaultPrettyPrinter().writeValue(taxFile, tax);
      System.out.println("Tax history saved to: " + taxFile.getAbsolutePath());
    } catch (Exception e) {
      System.out.println("Tax history retrieval failed: " + e.getMessage());
    }
    
    try {
      imgs = api.images(zpid);
      File imgsFile = new File(outputDir, "images_" + zpid + "_" + timestamp + ".json");
      mapper.writerWithDefaultPrettyPrinter().writeValue(imgsFile, imgs);
      System.out.println("Image information saved to: " + imgsFile.getAbsolutePath());
    } catch (Exception e) {
      System.out.println("Image information retrieval failed: " + e.getMessage());
    }
    
    try {
      zest = api.zestimate(zpid);
      File zestFile = new File(outputDir, "zestimate_" + zpid + "_" + timestamp + ".json");
      mapper.writerWithDefaultPrettyPrinter().writeValue(zestFile, zest);
      System.out.println("Zillow estimate saved to: " + zestFile.getAbsolutePath());
    } catch (Exception e) {
      System.out.println("Zillow estimate retrieval failed: " + e.getMessage());
    }
    
    try {
      rent = api.rentEstimate(zpid);
      File rentFile = new File(outputDir, "rent_" + zpid + "_" + timestamp + ".json");
      mapper.writerWithDefaultPrettyPrinter().writeValue(rentFile, rent);
      System.out.println("Rent estimate saved to: " + rentFile.getAbsolutePath());
    } catch (Exception e) {
      System.out.println("Rent estimate retrieval failed: " + e.getMessage());
    }
    
    try {
      comps = api.propertyComps(zpid, 10);
      File compsFile = new File(outputDir, "comps_" + zpid + "_" + timestamp + ".json");
      mapper.writerWithDefaultPrettyPrinter().writeValue(compsFile, comps);
      System.out.println("Comparable properties saved to: " + compsFile.getAbsolutePath());
    } catch (Exception e) {
      System.out.println("Comparable properties retrieval failed: " + e.getMessage());
    }
    
    // 5) New features: If property has coordinates, get additional information
    if (detailMin.lat != null && detailMin.lon != null) {
      System.out.println("Getting additional coordinate-based information...");
      
      try {
        JsonNode walkScore = api.walkAndTransitScore(detailMin.lat, detailMin.lon);
        File walkScoreFile = new File(outputDir, "walk_score_" + zpid + "_" + timestamp + ".json");
        mapper.writerWithDefaultPrettyPrinter().writeValue(walkScoreFile, walkScore);
        System.out.println("Walk/transit score saved to: " + walkScoreFile.getAbsolutePath());
      } catch (Exception e) {
        System.out.println("Walk/transit score retrieval failed: " + e.getMessage());
      }
      
      try {
        JsonNode localRentalRates = api.valueHistoryLocalRentalRates(detailMin.lat, detailMin.lon);
        File localRentalFile = new File(outputDir, "local_rental_rates_" + zpid + "_" + timestamp + ".json");
        mapper.writerWithDefaultPrettyPrinter().writeValue(localRentalFile, localRentalRates);
        System.out.println("Local rental rates saved to: " + localRentalFile.getAbsolutePath());
      } catch (Exception e) {
        System.out.println("Local rental rates retrieval failed: " + e.getMessage());
      }
      
      try {
        JsonNode localHomeValue = api.valueHistoryLocalHomeValue(detailMin.lat, detailMin.lon);
        File localHomeValueFile = new File(outputDir, "local_home_value_" + zpid + "_" + timestamp + ".json");
        mapper.writerWithDefaultPrettyPrinter().writeValue(localHomeValueFile, localHomeValue);
        System.out.println("Local home value trends saved to: " + localHomeValueFile.getAbsolutePath());
      } catch (Exception e) {
        System.out.println("Local home value trends retrieval failed: " + e.getMessage());
      }
    }

    // 6) Create comprehensive data file
    ObjectNode combinedData = mapper.createObjectNode();
    combinedData.put("timestamp", timestamp);
    combinedData.put("location", location);
    combinedData.put("zpid", zpid);
    combinedData.set("search", search);
    combinedData.set("searchCards", mapper.valueToTree(cards));
    combinedData.set("detail", detail);
    combinedData.set("detailMin", mapper.valueToTree(detailMin));
    if (tax != null) combinedData.set("tax", tax);
    if (imgs != null) combinedData.set("images", imgs);
    if (zest != null) combinedData.set("zestimate", zest);
    if (rent != null) combinedData.set("rent", rent);
    if (comps != null) combinedData.set("comps", comps);
    
    File combinedFile = new File(outputDir, "combined_" + zpid + "_" + timestamp + ".json");
    mapper.writerWithDefaultPrettyPrinter().writeValue(combinedFile, combinedData);
    System.out.println("Comprehensive data saved to: " + combinedFile.getAbsolutePath());
    
    // 7) Create search cards data file
    ObjectNode searchCardsData = mapper.createObjectNode();
    searchCardsData.put("timestamp", timestamp);
    searchCardsData.put("location", location);
    searchCardsData.put("totalFound", cards.size());
    searchCardsData.set("cards", mapper.valueToTree(cards));
    
    File searchCardsFile = new File(outputDir, "search_cards_" + timestamp + ".json");
    mapper.writerWithDefaultPrettyPrinter().writeValue(searchCardsFile, searchCardsData);
    System.out.println("Search cards data saved to: " + searchCardsFile.getAbsolutePath());
    
    System.out.println("\n=== Data Collection Complete ===");
    System.out.println("All data has been saved to the output directory!");
    System.out.println("Includes the following files:");
    System.out.println("- Search results and card data");
    System.out.println("- Property details (raw and standardized)");
    System.out.println("- Tax history, images, estimates, rent, comparable properties");
    if (detailMin.lat != null && detailMin.lon != null) {
      System.out.println("- Walk/transit scores, local rental and home value trends");
    }
    System.out.println("- Comprehensive data files");
    System.out.println("\nYou can now run the visualizer to view the data:");
    System.out.println("java -cp \".;lib\\jackson-databind-2.17.1.jar;lib\\jackson-core-2.17.1.jar;lib\\jackson-annotations-2.17.1.jar\" PropertyVisualizer");
  }
}
