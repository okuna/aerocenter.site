import SwiftUI

/// Hosts SwiftUI content of a fixed size inside a UIScrollView for proper
/// two-finger pinch zoom and panning, which the map quiz needs and SwiftUI's
/// ScrollView doesn't provide.
struct ZoomableScrollView<Content: View>: UIViewRepresentable {
    let contentSize: CGSize
    private let content: Content

    init(contentSize: CGSize, @ViewBuilder content: () -> Content) {
        self.contentSize = contentSize
        self.content = content()
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(host: UIHostingController(rootView: content))
    }

    func makeUIView(context: Context) -> UIScrollView {
        let scrollView = UIScrollView()
        scrollView.delegate = context.coordinator
        // Same zoom range as the website's viewport meta tag.
        scrollView.minimumZoomScale = 0.2
        scrollView.maximumZoomScale = 2
        scrollView.backgroundColor = .white
        scrollView.keyboardDismissMode = .onDrag

        let hostedView = context.coordinator.host.view!
        hostedView.frame = CGRect(origin: .zero, size: contentSize)
        hostedView.backgroundColor = .white
        scrollView.addSubview(hostedView)
        scrollView.contentSize = contentSize

        // Start zoomed out so the full map width is visible.
        DispatchQueue.main.async {
            let fit = scrollView.bounds.width / contentSize.width
            if fit > 0 {
                scrollView.zoomScale = max(fit, scrollView.minimumZoomScale)
            }
        }
        return scrollView
    }

    func updateUIView(_ uiView: UIScrollView, context: Context) {
        context.coordinator.host.rootView = content
    }

    final class Coordinator: NSObject, UIScrollViewDelegate {
        let host: UIHostingController<Content>

        init(host: UIHostingController<Content>) {
            self.host = host
        }

        func viewForZooming(in scrollView: UIScrollView) -> UIView? {
            host.view
        }
    }
}
