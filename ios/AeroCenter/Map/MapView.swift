import SwiftUI
import WebKit

/// The interactive map quiz, rendered from the bundled self-contained
/// map.html (generated from the web app by scripts/build-ios-map.js).
///
/// The map is a 1400x1200 SVG with over a hundred dynamically positioned
/// <input> overlays, so it is bundled as-is rather than rebuilt natively;
/// WKWebView provides the pinch-zoom and text entry the website relies on.
struct MapView: View {
    var body: some View {
        MapWebView()
            .ignoresSafeArea(edges: .bottom)
    }
}

private struct MapWebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        if let url = Bundle.main.url(forResource: "map", withExtension: "html") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

#Preview {
    MapView()
}
