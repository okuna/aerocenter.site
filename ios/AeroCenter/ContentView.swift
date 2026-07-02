import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            ClockView()
                .tabItem {
                    Label("Clock", systemImage: "clock")
                }
            MapQuizView()
                .tabItem {
                    Label("Map", systemImage: "map")
                }
        }
    }
}

#Preview {
    ContentView()
}
