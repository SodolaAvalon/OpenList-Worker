import assert from "node:assert/strict"
import { test } from "node:test"
import {
  getStrict139RedirectUrl,
  isStrict139DirectOnly,
} from "./direct_only_139"

test("strict redirect-only mode applies exclusively to /139 139Yun", () => {
  assert.equal(isStrict139DirectOnly({ driver: "139Yun", mount_path: "/139" }), true)
  assert.equal(isStrict139DirectOnly({ driver: "139Yun", mount_path: "/139/" }), true)
  assert.equal(isStrict139DirectOnly({ driver: "139Yun", mount_path: "/1392" }), false)
  assert.equal(isStrict139DirectOnly({ driver: "WebDav", mount_path: "/139" }), false)
  assert.equal(isStrict139DirectOnly({ driver: "139Yun", mount_path: "/other" }), false)
  assert.equal(isStrict139DirectOnly(null), false)
})

test("accepts an external HTTPS CDN link without stripping signed query", () => {
  const u = "https://cdn.yun.139.com/path/video.mp4?token=private%2Fvalue&expires=5000"
  assert.equal(
    getStrict139RedirectUrl(u, "https://sodolapan2026.me/api/d/139/video.mp4"),
    u,
  )
})

test("rejects broken, insecure, credentialed, or internal redirect targets", () => {
  const origin = "https://sodolapan2026.me/api/d/139/test.zip"
  for (const url of [
    "",
    "/api/d/139/test.zip",
    "not a url",
    "http://cdn.yun.139.com/test.zip",
    "ftp://cdn.yun.139.com/test.zip",
    "https://user:password@cdn.yun.139.com/test.zip",
    "https://sodolapan2026.me/api/p/139/test.zip",
    "https://www.sodolapan2026.me/api/p/139/test.zip",
    "https://pan.sodola.workers.dev/api/d/139/test.zip",
  ]) {
    assert.equal(getStrict139RedirectUrl(url, origin), null, url)
  }
})

test("rejects redirect loops on the workers.dev public endpoint too", () => {
  assert.equal(
    getStrict139RedirectUrl(
      "https://pan.sodola.workers.dev/api/d/139/example.mkv",
      "https://pan.sodola.workers.dev/api/d/139/example.mkv",
    ),
    null,
  )
})
