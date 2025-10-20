import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class JsonSchemaProbe {
  static record NodeInfo(String path, String type) {}

  public static void main(String[] args) throws Exception {
    ObjectMapper om = new ObjectMapper();
    JsonNode root;
    if (args.length > 0 && Files.exists(Path.of(args[0]))) {
      root = om.readTree(new File(args[0]));
    } else {
      String input = new String(System.in.readAllBytes());
      if (input.isBlank()) {
        System.out.println("Usage: JsonSchemaProbe <json-file>\nOr:   cat file.json | JsonSchemaProbe");
        return;
      }
      root = om.readTree(input);
    }
    List<NodeInfo> nodes = probe(root);
    nodes.forEach(n -> System.out.println(n.path + " :: " + n.type));
  }

  public static List<NodeInfo> probe(JsonNode root) {
    List<NodeInfo> out = new ArrayList<>();
    walk(root, "$", out, new HashSet<>());
    out.sort(Comparator.comparing(a -> a.path));
    return out;
  }

  private static void walk(JsonNode n, String path, List<NodeInfo> out, Set<String> seen) {
    String kind = n.isObject()? "object" :
                  n.isArray()? "array" :
                  n.isTextual()? "string" :
                  n.isNumber()? "number" :
                  n.isBoolean()? "boolean" :
                  n.isNull()? "null" : "unknown";
    String key = path + "|" + kind;
    if (seen.add(key)) out.add(new NodeInfo(path, kind));

    if (n.isObject()) {
      n.fieldNames().forEachRemaining(k -> walk(n.get(k), path + "." + k, out, seen));
    } else if (n.isArray()) {
      int limit = Math.min(3, n.size());
      for (int i=0;i<limit;i++) walk(n.get(i), path + "[*]", out, seen);
    }
  }
}
