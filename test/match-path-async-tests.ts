import { assert } from "chai";
import { createMatchPathAsync } from "../src/match-path-async";
import { join, dirname } from "path";
import { removeExtension } from "../src/filesystem";

describe("match-path-async", () => {
  it("should locate path that matches with star and exists", done => {
    const matchPath = createMatchPathAsync("/root/", {
      "lib/*": ["location/*"]
    });
    const existingPath = join("/root", "location", "mylib", "index.ts");
    matchPath(
      "lib/mylib",
      (_path, callback) => callback(),
      (path, callback) => callback(undefined, path === existingPath),
      undefined,
      (_err, result) => {
        assert.equal(result, dirname(existingPath));
        done();
      }
    );
  });

  it("should resolve to correct path when many are specified", done => {
    const matchPath = createMatchPathAsync("/root/", {
      "lib/*": ["foo1/*", "foo2/*", "location/*", "foo3/*"]
    });
    const existingPath = join("/root", "location", "mylib", "index.ts");
    matchPath(
      "lib/mylib",
      (_path, callback) => callback(),
      (path, callback) => callback(undefined, path === existingPath),
      [".ts"],
      (_err, result) => {
        assert.equal(result, dirname(existingPath));
        done();
      }
    );
  });

  it("should locate path that matches with star and prioritize pattern with longest prefix", done => {
    const matchPath = createMatchPathAsync("/root/", {
      "*": ["location/*"],
      "lib/*": ["location/*"]
    });
    const existingPath1 = join("/root", "location", "lib", "mylib", "index.ts");
    const existingPath2 = join("/root", "location", "mylib", "index.ts");
    matchPath(
      "lib/mylib",
      (_path, callback) => callback(),
      (name, callback) =>
        callback(undefined, name === existingPath1 || name === existingPath2),
      [".ts"],
      (_err, result) => {
        assert.equal(result, dirname(existingPath2));
        done();
      }
    );
  });

  it("should locate path that matches with star and exists with extension", done => {
    const matchPath = createMatchPathAsync("/root/", {
      "lib/*": ["location/*"]
    });
    const existingPath = join("/root", "location", "mylib.myext");
    matchPath(
      "lib/mylib",
      (_path, callback) => callback(),
      (path, callback) => callback(undefined, path === existingPath),
      [".js", ".myext"],
      (_err, result) => {
        assert.equal(result, removeExtension(existingPath));
        done();
      }
    );
  });

  it("should resolve request with extension specified", done => {
    const matchPath = createMatchPathAsync("/root/", {
      "lib/*": ["location/*"]
    });
    const existingPath = join("/root", "location", "test.jpg");
    matchPath(
      "lib/test.jpg",
      (_path, callback) => callback(),
      (path, callback) => callback(undefined, path === existingPath),
      [".js", ".myext"],
      (_err, result) => {
        assert.equal(result, existingPath);
        done();
      }
    );
  });

  it("should locate path that matches without star and exists", done => {
    const matchPath = createMatchPathAsync("/root/", {
      "lib/foo": ["location/foo"]
    });
    const existingPath = join("/root", "location", "foo.ts");
    matchPath(
      "lib/foo",
      (_path, callback) => callback(),
      (path, callback) => callback(undefined, path === existingPath),
      undefined,
      (_err, result) => {
        assert.equal(result, removeExtension(existingPath));
        done();
      }
    );
  });

  it("should resolve to parent folder when filename is in subfolder", done => {
    const matchPath = createMatchPathAsync("/root/", {
      "lib/*": ["location/*"]
    });
    const existingPath = join("/root", "location", "mylib", "index.ts");
    matchPath(
      "lib/mylib",
      (_path, callback) => callback(),
      (path, callback) => callback(undefined, path === existingPath),
      undefined,
      (_err, result) => {
        assert.equal(result, dirname(existingPath));
        done();
      }
    );
  });

  /*

  it("should resolve from main field in package.json", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const existingPath = join("/root", "location", "mylib", "kalle.ts");
    const result = matchPath(
      "lib/mylib",
      (_: string) => ({ main: "./kalle.ts" }),
      (name: string) => name === existingPath
    );
    assert.equal(result, removeExtension(existingPath));
  });

  it("should resolve from main field in package.json and correctly remove file extension", () => {
    const matchPath = createMatchPath("/root/", { "lib/*": ["location/*"] });
    const result = matchPath(
      "lib/mylib.js",
      (_: string) => ({ main: "./kalle.js" }),
      (name: string) =>
        name === join("/root", "location", "mylib.js", "kalle.js"),
      [".ts", ".js"]
    );

    // Make sure we escape the "."
    const result2 = matchPath(
      "lib/mylibjs",
      (_: string) => ({ main: "./kallejs" }),
      (name: string) =>
        name === join("/root", "location", "mylibjs", "kallejs"),
      [".ts", ".js"]
    );

    assert.equal(result, join("/root", "location", "mylib.js", "kalle"));
    assert.equal(result2, join("/root", "location", "mylibjs", "kallejs"));
  });
*/

  it("should resolve to with the help of baseUrl when not explicitly set", done => {
    const matchPath = createMatchPathAsync("/root/", {});
    const existingPath = join("/root", "mylib", "index.ts");
    matchPath(
      "mylib",
      (_path, callback) => callback(),
      (path, callback) => callback(undefined, path === existingPath),
      undefined,
      (_err, result) => {
        assert.equal(result, dirname(existingPath));
        done();
      }
    );
  });

  it("should not locate path that does not match", done => {
    const matchPath = createMatchPathAsync("/root/", {
      "lib/*": ["location/*"]
    });
    const existingPath = join("root", "location", "mylib");
    matchPath(
      "mylib",
      (_path, callback) => callback(),
      (path, callback) => callback(undefined, path === existingPath),
      undefined,
      (_err, result) => {
        assert.equal(result, undefined);
        done();
      }
    );
  });
});