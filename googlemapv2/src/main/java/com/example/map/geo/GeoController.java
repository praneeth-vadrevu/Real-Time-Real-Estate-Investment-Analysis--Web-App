package com.example.map.geo;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/geo")
public class GeoController {

  private final GoogleApi31Service svc;
  public GeoController(GoogleApi31Service svc){ this.svc = svc; }

  /**
   * Keyword/place text query (suitable for search input)
   * Example: /api/geo/text?text=white%20house&place=washington%20dc
   */
  @GetMapping("/text")
  public JsonNode text(@RequestParam(required=false) String text,
                       @RequestParam(required=false) String place,
                       @RequestParam(required=false) String city,
                       @RequestParam(required=false) String state,
                       @RequestParam(required=false) String country,
                       @RequestParam(required=false) String postcode) throws Exception {
    return svc.byText(text, place, city, state, country, postcode);
  }

  /**
   * Circular range search (center point + radius, optional text keyword)
   * Example: /api/geo/circle?lat=38.8977&lon=-77.0365&radius=50000&text=restaurant
   */
  @GetMapping("/circle")
  public JsonNode circle(@RequestParam("lat") double lat,
                         @RequestParam("lon") double lon,
                         @RequestParam(defaultValue = "1000") int radius,
                         @RequestParam(required=false) String text) throws Exception {
    return svc.byCircle(lat, lon, text, radius);
  }

  /**
   * Raw passthrough: POST JSON body consistent with RapidAPI playground
   * Example: POST /api/geo/raw  body: {"text":"white house","place":"washington DC","radius":"my"}
   */
  @PostMapping("/raw")
  public JsonNode raw(@RequestBody java.util.Map<String,Object> body) throws Exception {
    return svc.query(body);
  }
}
