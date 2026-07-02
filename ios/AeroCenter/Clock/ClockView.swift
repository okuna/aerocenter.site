import SwiftUI

/// Native port of the non-radar clock UI from clock/index.php.
struct ClockView: View {
    @StateObject private var model = ClockModel()

    private let runningBackground = Color(red: 0xCE / 255, green: 0xFF / 255, blue: 0xAD / 255)
    private let pausedBackground = Color(red: 0xFF / 255, green: 0xCD / 255, blue: 0xBA / 255)

    var body: some View {
        VStack(spacing: 0) {
            adjustmentBar
            clockFace
            controlBar
            altimeterTable
                .padding(.top, 16)
            Spacer()
        }
        // The website loads NoSleep.js to keep the display on; natively we
        // just disable the idle timer while the clock is visible.
        .onAppear { UIApplication.shared.isIdleTimerDisabled = true }
        .onDisappear { UIApplication.shared.isIdleTimerDisabled = false }
    }

    private var adjustmentBar: some View {
        navBar {
            navButton("-01:00") { model.decrementHour() }
            navButton("+01:00") { model.incrementHour() }
            navButton("-00:10") { model.decrementTenMinutes() }
            navButton("+00:10") { model.incrementTenMinutes() }
            navButton("-00:01") { model.decrementMinute() }
            navButton("+00:01") { model.incrementMinute() }
        }
    }

    private var clockFace: some View {
        Text(model.timeString)
            .font(.system(size: 500, design: .monospaced))
            .minimumScaleFactor(0.01)
            .lineLimit(1)
            .padding(.horizontal, 10)
            .frame(maxWidth: .infinity)
            .background(model.isPaused ? pausedBackground : runningBackground)
    }

    private var controlBar: some View {
        navBar {
            navButton("Start") { model.start() }
            navButton("Pause", color: .red) { model.pause() }
            navButton("Reset") { model.useCurrentTime() }
            navButton("<<", color: .red) { model.rewind() }
        }
    }

    private var altimeterTable: some View {
        Grid(alignment: .leading, horizontalSpacing: 12, verticalSpacing: 4) {
            ForEach(model.stations) { station in
                GridRow {
                    Text(station.id)
                        .gridColumnAlignment(.trailing)
                    Text(station.altimeterLastThree)
                    Text(station.metar)
                }
            }
        }
        .font(.system(.caption, design: .monospaced))
        .padding(8)
        .overlay(
            Rectangle().stroke(Color.black, lineWidth: 1)
        )
        .padding(.horizontal, 8)
    }

    private func navBar<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        HStack(spacing: 1) {
            content()
        }
        .background(Color(white: 0.94))
        .overlay(
            Rectangle().stroke(Color(white: 0.8), lineWidth: 1)
        )
    }

    private func navButton(_ title: String, color: Color = Color(white: 0.38),
                           action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.callout)
                .foregroundColor(color)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color(white: 0.94))
        }
    }
}

#Preview {
    ClockView()
}
