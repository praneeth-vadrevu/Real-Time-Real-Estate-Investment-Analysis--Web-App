import java.net.URI;
import java.net.URLEncoder;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;

/**
 * API.java — Zillow (RapidAPI · zillow-com1 v1) client + normalization + enrichment.
 * Requires headers: x-rapidapi-key, x-rapidapi-host.
 *
 * Build:
 *   javac -cp .:jackson-annotations.jar:jackson-core.jar:jackson-databind.jar API.java
 * Run demo:
 *   java  -cp .:jackson-annotations.jar:jackson-core.jar:jackson-databind.jar API
 *
 * Environment:
 *   RAPIDAPI_KEY = <your RapidAPI key> (falls back to INSECURE_FALLBACK_KEY for quick local tests)
 */
public class API {

  // -------- Config --------
  public static final String HOST = "zillow-com1.p.rapidapi.com";
  public static final String BASE = "https://" + HOST;

  // Fallback key for local testing only. Replace with env var in production.
  private static final String INSECURE_FALLBACK_KEY = "cdff686e3dmsh63e57fae45f21f1p113364jsn85fbadde0225";

  private static String apiKey() {
    String k = System.getenv("RAPIDAPI_KEY");
    return (k != null && !k.isBlank()) ? k : INSECURE_FALLBACK_KEY;
  }
  private static String enc(String s){ return URLEncoder.encode(s, StandardCharsets.UTF_8); }

  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(6)).build();
  private final ObjectMapper om = new ObjectMapper();

  // -------- Low-level GET --------
  private JsonNode get(String pathWithQuery) throws Exception {
    HttpRequest req = HttpRequest.newBuilder(URI.create(BASE + pathWithQuery))
        .timeout(Duration.ofSeconds(20))
        .header("x-rapidapi-key", apiKey())
        .header("x-rapidapi-host", HOST)
        .GET().build();
    HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
    if (res.statusCode() < 200 || res.statusCode() >= 300) {
      throw new RuntimeException("GET " + pathWithQuery + " -> " + res.statusCode() + " " + res.body());
    }
    return om.readTree(res.body());
  }

  // -------- Endpoint wrappers (v1) --------
  public JsonNode propertyExtendedSearch(String location, String status, Integer page) throws Exception {
    String q = "/propertyExtendedSearch?location=" + enc(location)
             + (status!=null ? "&status=" + enc(status) : "")
             + (page!=null ? "&page=" + page : "");
    return get(q);
  }
  public JsonNode propertyDetail(String zpid) throws Exception { return get("/property?zpid=" + enc(zpid)); }
  public JsonNode images(String zpid) throws Exception { return get("/images?zpid=" + enc(zpid)); }
  public JsonNode priceAndTaxHistory(String zpid) throws Exception { return get("/priceAndTaxHistory?zpid=" + enc(zpid)); }
  public JsonNode zestimate(String zpid) throws Exception { return get("/zestimate?zpid=" + enc(zpid)); }
  public JsonNode rentEstimate(String zpid) throws Exception { return get("/rentEstimate?zpid=" + enc(zpid)); }
  public JsonNode propertyComps(String zpid, Integer count) throws Exception {
    return get("/propertyComps?zpid=" + enc(zpid) + (count!=null ? "&count=" + count : ""));
  }
  public JsonNode valueHistoryLocalRentalRates(double lat, double lon) throws Exception {
    return get("/valueHistory/localRentalRates?lat=" + lat + "&lon=" + lon);
  }
  public JsonNode valueHistoryLocalHomeValue(double lat, double lon) throws Exception {
    return get("/valueHistory/localHomeValue?lat=" + lat + "&lon=" + lon);
  }
  public JsonNode walkAndTransitScore(double lat, double lon) throws Exception {
    return get("/walkAndTransitScore?lat=" + lat + "&lon=" + lon);
  }
  public JsonNode propertyByCoordinates(double lat, double lon, int radiusMeters, int page) throws Exception {
    return get("/propertyByCoordinates?lat=" + lat + "&lon=" + lon + "&radius=" + radiusMeters + "&page=" + page);
  }
  public JsonNode propertyByPolygon(String polygonWkt, int page) throws Exception {
    return get("/propertyByPolygon?polygon=" + enc(polygonWkt) + "&page=" + page);
  }
  public JsonNode searchByUrl(String zillowUrl) throws Exception { return get("/searchByUrl?url=" + enc(zillowUrl)); }
  public JsonNode building(String zpid) throws Exception { return get("/building?zpid=" + enc(zpid)); }
  public JsonNode propertyByMls(String mlsId) throws Exception { return get("/propertyByMls?mlsId=" + enc(mlsId)); }
  public JsonNode zestimateHistory(String zpid) throws Exception { return get("/zestimateHistory?zpid=" + enc(zpid)); }
  public JsonNode buildWebUrl(String zpid) throws Exception { return get("/buildWebUrl?zpid=" + enc(zpid)); }
  public JsonNode valueHistoryZestimatePctChange(double lat, double lon) throws Exception {
    return get("/valueHistory/zestimatePercentageChange?lat=" + lat + "&lon=" + lon);
  }
  public JsonNode valueHistoryListingPrices(double lat, double lon) throws Exception {
    return get("/valueHistory/listingPrices?lat=" + lat + "&lon=" + lon);
  }
  public JsonNode valueHistoryTaxAssessment(String zpid) throws Exception { return get("/valueHistory/taxAssessment?zpid=" + enc(zpid)); }
  public JsonNode valueHistoryTaxPaid(String zpid) throws Exception { return get("/valueHistory/taxPaid?zpid=" + enc(zpid)); }
  public JsonNode valueEstimate(String zpid) throws Exception { return get("/valueEstimate?zpid=" + enc(zpid)); }
  public JsonNode mapBoundary(String location) throws Exception { return get("/mapBoundary?location=" + enc(location)); }
  public JsonNode property3dTour(String zpid) throws Exception { return get("/property3dtour?zpid=" + enc(zpid)); }
  public JsonNode propertyFloorPlan(String zpid) throws Exception { return get("/propertyFloorPlan?zpid=" + enc(zpid)); }
  public JsonNode offMarketData(String zpid) throws Exception { return get("/offMarketData?zpid=" + enc(zpid)); }
  public JsonNode monthlyInventory(String postalCode, Integer page) throws Exception {
    return get("/monthlyInventory?postal_code=" + enc(postalCode) + (page!=null ? "&page=" + page : ""));
  }
  public JsonNode ping() throws Exception { return get("/ping"); }

  // -------- Normalized models --------
  public static class SearchCard {
    public String zpid, address, status, imgSrc, propertyType, currency;
    public Double price, bedrooms, bathrooms, livingArea, lotAreaValue, lat, lon;
    public Integer daysOnZillow;
    @Override public String toString() {
      return "SearchCard{zpid=" + zpid + ", price=" + price + ", beds=" + bedrooms +
             ", baths=" + bathrooms + ", sqft=" + livingArea + ", addr=" + address + "}";
    }
  }

  public static class PropertyDetailMin {
    public String zpid, address, homeType;
    public Double price, zestimate, livingArea, lotArea, beds, baths, lat, lon, hoaMonthly, annualTax;
    public Integer yearBuilt;
    public List<String> photos;
    @Override public String toString() {
      return "PropertyDetailMin{zpid=" + zpid + ", price=" + price + ", zestimate=" + zestimate +
             ", beds=" + beds + ", baths=" + baths + ", sqft=" + livingArea + ", year=" + yearBuilt + "}";
    }
  }

  public List<SearchCard> toSearchCards(JsonNode searchRoot) {
    List<SearchCard> out = new ArrayList<>();
    JsonNode arr = searchRoot.has("props") ? searchRoot.get("props")
                  : searchRoot.has("results") ? searchRoot.get("results")
                  : MissingNode.getInstance();
    if (arr.isArray()) {
      for (JsonNode it : arr) {
        SearchCard c = new SearchCard();
        c.zpid = str(it, "zpid");
        c.address = str(it, "address");
        c.status = str(it, "listingStatus", "status");
        c.imgSrc = str(it, "imgSrc", "image");
        c.propertyType = str(it, "propertyType");
        c.currency = str(it, "currency");
        c.price = num(it, "price", "unformattedPrice");
        c.bedrooms = num(it, "bedrooms", "beds");
        c.bathrooms = num(it, "bathrooms", "baths");
        c.livingArea = num(it, "livingArea", "sqft", "area");
        c.lotAreaValue = num(it, "lotAreaValue", "lotSize");
        c.lat = num(it, "latitude", "lat");
        c.lon = num(it, "longitude", "lng", "lon");
        c.daysOnZillow = intval(it, "daysOnZillow");
        if (c.zpid != null) out.add(c);
      }
    }
    return out;
  }

  public PropertyDetailMin toDetailMin(JsonNode detailRoot) {
    JsonNode n = first(detailRoot, "data", "result", "property", null);
    PropertyDetailMin d = new PropertyDetailMin();
    d.zpid = str(n, "zpid", "id");
    d.price = num(n, "price", "listPrice", "unformattedPrice", "priceUnformatted");
    d.zestimate = num(n, "zestimate");
    d.livingArea = num(n, "livingAreaValue", "livingArea", "sqft", "area");
    d.lotArea = num(n, "lotAreaValue", "lotSize", "lotArea");
    d.beds = num(n, "bedrooms", "beds");
    d.baths = num(n, "bathrooms", "baths", "bathroomsTotalInteger");
    d.yearBuilt = intval(n, "yearBuilt", "year_built");
    d.homeType = str(n, "homeType");
    d.lat = num(n, "latitude", "lat");
    d.lon = num(n, "longitude", "lng", "lon");

    d.hoaMonthly = num(n, "monthlyHoaFee", "hoaFee");
    if (d.hoaMonthly == null) {
      Double hoaAnnual = num(n, "hoaAnnualFee");
      if (hoaAnnual != null) d.hoaMonthly = hoaAnnual / 12.0;
    }
    d.annualTax = num(first(n, "taxHistory", null).path(0), "taxPaid");
    if (d.annualTax == null) d.annualTax = num(n, "annualTaxAmount");

    d.address = str(n, "address", "streetAddress");
    if (d.address == null && detailRoot.has("data")) {
      JsonNode chip = detailRoot.get("data").get("formattedChip");
      if (chip != null && chip.has("location")) {
        var loc = chip.get("location");
        StringBuilder sb = new StringBuilder();
        for (JsonNode x : loc) {
          if (x.has("fullValue")) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(x.get("fullValue").asText());
          }
        }
        d.address = sb.length() > 0 ? sb.toString() : null;
      }
    }
    d.photos = new ArrayList<>();
    JsonNode images = first(n, "photoUrlsHighRes", "photoUrls", "images", null);
    if (images != null && images.isArray()) {
      for (JsonNode p : images) {
        String u = p.isTextual() ? p.asText() : str(p, "url", "href", "src");
        if (u != null && !u.isBlank()) d.photos.add(u);
      }
    } else {
      String u = str(n, "imageLink", "imgSrc");
      if (u != null) d.photos.add(u);
    }
    return d;
  }

  // -------- Monthly Inventory DTO + parser --------
  public static class MonthlyInventoryRecord {
    public String postalCode;
    public Integer monthYyyymm;
    public Integer totalListingCount, activeListingCount, newListingCount, medianDaysOnMarket;
    public Double medianListingPrice, averageListingPrice;
    public Double totalListingCountMm, activeListingCountMm, newListingCountMm,
                   medianListingPriceMm, averageListingPriceMm, medianDaysOnMarketMm;
    @Override public String toString() {
      return "MonthlyInventoryRecord{zip=" + postalCode + ", ym=" + monthYyyymm +
             ", active=" + activeListingCount + ", new=" + newListingCount +
             ", medianPrice=" + medianListingPrice + ", dom=" + medianDaysOnMarket + "}";
    }
  }
  public List<MonthlyInventoryRecord> toMonthlyInventory(JsonNode root) {
    List<MonthlyInventoryRecord> out = new ArrayList<>();
    JsonNode arr = root.path("records");
    if (arr.isArray()) {
      for (JsonNode r : arr) {
        MonthlyInventoryRecord m = new MonthlyInventoryRecord();
        m.postalCode = str(r, "postal_code");
        m.monthYyyymm = intval(r, "month_date_yyyymm");
        m.totalListingCount = intval(r, "total_listing_count");
        m.activeListingCount = intval(r, "active_listing_count");
        m.newListingCount = intval(r, "new_listing_count");
        m.medianListingPrice = num(r, "median_listing_price");
        m.averageListingPrice = num(r, "average_listing_price");
        m.medianDaysOnMarket = intval(r, "median_days_on_market");
        m.totalListingCountMm = num(r, "total_listing_count_mm");
        m.activeListingCountMm = num(r, "active_listing_count_mm");
        m.newListingCountMm = num(r, "new_listing_count_mm");
        m.medianListingPriceMm = num(r, "median_listing_price_mm");
        m.averageListingPriceMm = num(r, "average_listing_price_mm");
        m.medianDaysOnMarketMm = num(r, "median_days_on_market_mm");
        out.add(m);
      }
    }
    return out;
  }

  // -------- Enrichment --------
  public static class EnrichedProperty {
    // base/list
    public String zpid, address, status, imgSrc, propertyType, currency;
    public Double price, bedrooms, bathrooms, livingArea, lotAreaValue, lat, lon;
    public Integer daysOnZillow;
    // detail/tax/estimates/media/comps
    public Integer yearBuilt;
    public Double hoaMonthly, annualTax, zestimate, rentEstimate;
    public List<String> photoUrls = new ArrayList<>();
    public List<String> heating, cooling, parkingFeatures;
    public Integer compsCount;
    public Double compsMedianSoldPrice, compsMedianPpsf;
    public Double pricePerSqft, lotToBuildingRatio;
    // extras
    public String zillowWebUrl;
    public List<String> tour3dUrls;
    public List<String> floorPlanUrls;

    @Override public String toString() {
      return "EnrichedProperty{zpid=" + zpid + ", price=" + price + ", beds=" + bedrooms +
        ", baths=" + bathrooms + ", sqft=" + livingArea + ", year=" + yearBuilt +
        ", tax=" + annualTax + ", hoaMonthly=" + hoaMonthly + ", zest=" + zestimate +
        ", rent=" + rentEstimate + ", comps=" + compsCount + "}";
    }
  }

  public EnrichedProperty fetchEnrichedByZpid(String zpid) throws Exception {
    EnrichedProperty ep = new EnrichedProperty();
    ep.zpid = zpid;

    // detail
    JsonNode detail = propertyDetail(zpid);
    PropertyDetailMin d = toDetailMin(detail);
    if (d != null) {
      ep.address = d.address; ep.price = d.price; ep.bedrooms = d.beds; ep.bathrooms = d.baths;
      ep.livingArea = d.livingArea; ep.lotAreaValue = d.lotArea; ep.lat = d.lat; ep.lon = d.lon;
      ep.yearBuilt = d.yearBuilt; ep.hoaMonthly = d.hoaMonthly; ep.zestimate = d.zestimate;
      if (d.photos != null) ep.photoUrls.addAll(d.photos);

      JsonNode root = first(detail, "data", "result", "property", null);
      if (root != null) {
        ep.heating = readStringArray(root, "resoFacts", "heating");
        ep.cooling = readStringArray(root, "resoFacts", "cooling");
        ep.parkingFeatures = readStringArray(root, "resoFacts", "parkingFeatures");
      }
    }

    // tax
    try { Double t = pickLatestTaxPaid(priceAndTaxHistory(zpid)); if (t != null) ep.annualTax = t; } catch (Exception ignore){}

    // estimates
    if (ep.zestimate == null) try { ep.zestimate = num(zestimate(zpid), "zestimate", "amount", "price"); } catch (Exception ignore){}
    try { ep.rentEstimate = num(rentEstimate(zpid), "rent", "rentZestimate", "amount"); } catch (Exception ignore){}

    // images
    try {
      JsonNode imgs = images(zpid);
      if (imgs.isArray()) for (JsonNode p : imgs) {
        String u = p.isTextual() ? p.asText() : str(p, "url", "src");
        if (u != null && !u.isBlank()) ep.photoUrls.add(u);
      }
    } catch (Exception ignore){}

    // comps
    try {
      JsonNode comps = propertyComps(zpid, 10);
      var s = summarizeComps(comps);
      ep.compsCount = s.count; ep.compsMedianSoldPrice = s.medPrice; ep.compsMedianPpsf = s.medPpsf;
    } catch (Exception ignore){}

    // extras: 3d, floorplan, web url
    try {
      JsonNode tours = property3dTour(zpid);
      List<String> t = new ArrayList<>();
      if (tours.isArray()) for (JsonNode x : tours) {
        String u = x.isTextual() ? x.asText() : str(x, "url", "src", "link");
        if (u != null && !u.isBlank()) t.add(u);
      }
      if (!t.isEmpty()) ep.tour3dUrls = t;
    } catch (Exception ignore){}
    try {
      JsonNode fps = propertyFloorPlan(zpid);
      List<String> f = new ArrayList<>();
      if (fps.isArray()) for (JsonNode x : fps) {
        String u = x.isTextual() ? x.asText() : str(x, "url", "src");
        if (u != null && !u.isBlank()) f.add(u);
      }
      if (!f.isEmpty()) ep.floorPlanUrls = f;
    } catch (Exception ignore){}
    try { JsonNode w = buildWebUrl(zpid); ep.zillowWebUrl = str(w, "url", "link", "webUrl"); } catch (Exception ignore){}

    // derived
    if (ep.price != null && ep.livingArea != null && ep.livingArea > 0) ep.pricePerSqft = ep.price / ep.livingArea;
    if (ep.lotAreaValue != null && ep.livingArea != null && ep.livingArea > 0) ep.lotToBuildingRatio = ep.lotAreaValue / ep.livingArea;

    return ep;
  }

  // -------- Helpers --------
  private static JsonNode first(JsonNode r, String... keys) {
    if (r == null) return r;
    for (String k : keys) {
      if (k == null) return r;
      JsonNode n = r.get(k);
      if (n != null && !n.isMissingNode() && !n.isNull()) return n;
    }
    return r;
  }
  private static String str(JsonNode n, String... ks) {
    for (String k: ks) { JsonNode x = n.get(k); if (x!=null && x.isTextual()) return x.asText(); }
    return null;
  }
  private static Double num(JsonNode n, String... ks) {
    for (String k: ks) {
      JsonNode x = n.get(k);
      if (x==null || x.isNull() || x.isMissingNode()) continue;
      if (x.isNumber()) return x.doubleValue();
      try { return Double.parseDouble(x.asText().replaceAll("[^0-9.\\-]","")); } catch(Exception ignore){}
    }
    return null;
  }
  private static Integer intval(JsonNode n, String... ks) {
    Double d = num(n, ks); return d==null?null:d.intValue();
  }
  private static List<String> readStringArray(JsonNode base, String objKey, String arrayKey) {
    List<String> out = new ArrayList<>();
    JsonNode arr = base.path(objKey).path(arrayKey);
    if (arr.isArray()) for (JsonNode x : arr) if (x.isTextual()) out.add(x.asText());
    return out.isEmpty()? null : out;
  }
  private static class CompStats { int count; Double medPrice; Double medPpsf; }
  private static CompStats summarizeComps(JsonNode compsRoot) {
    CompStats s = new CompStats();
    List<Double> prices = new ArrayList<>(), ppsf = new ArrayList<>();
    JsonNode arr = compsRoot.has("comparables") ? compsRoot.get("comparables")
                : compsRoot.has("results") ? compsRoot.get("results") : compsRoot;
    if (arr != null && arr.isArray()) {
      for (JsonNode c : arr) {
        Double p = num(c, "price", "unformattedPrice", "soldPrice");
        Double sqft = num(c, "livingArea", "sqft");
        if (p != null) prices.add(p);
        if (p != null && sqft != null && sqft > 0) ppsf.add(p / sqft);
      }
    }
    s.count = prices.size();
    if (!prices.isEmpty()) s.medPrice = median(prices);
    if (!ppsf.isEmpty()) s.medPpsf = median(ppsf);
    return s;
  }
  private static Double median(List<Double> xs) {
    xs.sort(Double::compareTo);
    int n = xs.size();
    if (n == 0) return null;
    return (n % 2 == 1) ? xs.get(n/2) : (xs.get(n/2 - 1) + xs.get(n/2)) / 2.0;
  }
  private static Double pickLatestTaxPaid(JsonNode taxRoot) {
    JsonNode hist = first(taxRoot, "data", null).path("taxHistory");
    if (!hist.isArray() || hist.size() == 0) hist = taxRoot.path("taxHistory");
    Double best = null; Integer bestYear = null;
    if (hist.isArray()) {
      for (JsonNode t : hist) {
        Integer y = t.has("taxYear") && t.get("taxYear").canConvertToInt() ? t.get("taxYear").asInt() : null;
        Double paid = num(t, "taxPaid", "amount");
        if (paid != null && (bestYear == null || (y != null && y > bestYear))) { best = paid; bestYear = y; }
      }
    }
    return best;
  }

  // -------- Demo (optional) --------
  public static void main(String[] args) throws Exception {
    API api = new API();
    JsonNode search = api.propertyExtendedSearch("Santa Monica, CA", "for_sale", 1);
    List<SearchCard> cards = api.toSearchCards(search);
    System.out.println("search size=" + cards.size());
    if (!cards.isEmpty()) {
      String zpid = cards.get(0).zpid;
      EnrichedProperty ep = api.fetchEnrichedByZpid(zpid);
      System.out.println(ep);

      // Monthly inventory by ZIP (extract ZIP from address if needed)
      JsonNode inv = api.monthlyInventory("85051", 1);
      List<MonthlyInventoryRecord> recs = api.toMonthlyInventory(inv);
      if (!recs.isEmpty()) System.out.println("inventory sample: " + recs.get(0));
    }
  }
}