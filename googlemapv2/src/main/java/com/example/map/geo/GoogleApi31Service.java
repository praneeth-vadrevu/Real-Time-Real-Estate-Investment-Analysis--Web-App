package com.example.map.geo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

@Service
public class GoogleApi31Service {

  @Value("${googleapi31.rapidapi.host}") private String host;
  @Value("${googleapi31.rapidapi.key}")  private String key;
  @Value("${googleapi31.endpoint}")      private String endpoint;

  private final HttpClient http = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(10)).build();
  private final ObjectMapper om = new ObjectMapper();

  /**
   * Thin wrapper for POST https://google-api31.p.rapidapi.com/map
   * Accepted fields (per RapidAPI playground): text, place, street, city, country,
   * state, postcode, latitude, longitude, radius
   */
  public JsonNode query(Map<String, Object> params) throws Exception {
    ObjectNode body = om.createObjectNode();
    // Only include non-null values to keep payload clean
    params.forEach((k, v) -> {
      if (v == null) return;
      if (v instanceof Number) body.putPOJO(k, v);
      else body.put(k, String.valueOf(v));
    });

    HttpRequest req = HttpRequest.newBuilder(URI.create(endpoint))
        .header("Content-Type", "application/json")
        .header("x-rapidapi-host", host)
        .header("x-rapidapi-key", key)
        .POST(HttpRequest.BodyPublishers.ofString(body.toString(), StandardCharsets.UTF_8))
        .build();

    HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
    // Pass through the third-party response directly; if coordinate/address extraction is needed, do mapping at controller level
    return om.readTree(res.body());
  }

  /** Convenience methods: Two main use cases - keyword/place text search; or center point + radius search */
  public JsonNode byText(String text, String place, String city, String state, String country, String postcode) throws Exception {
    return query(Map.of(
        "text", nvl(text),
        "place", nvl(place),
        "city", nvl(city),
        "state", nvl(state),
        "country", nvl(country),
        "postcode", nvl(postcode)
    ));
  }

  public JsonNode byCircle(double latitude, double longitude, String text, int radiusMeters) throws Exception {
    return query(Map.of(
        "latitude", latitude,
        "longitude", longitude,
        "radius", radiusMeters,
        "text", nvl(text)
    ));
  }

  private static String nvl(String s){ return (s==null || s.isBlank()) ? "" : s; }
}
