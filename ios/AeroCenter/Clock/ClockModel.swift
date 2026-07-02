import Foundation

/// Native port of the non-radar clock logic from clock/index.php.
///
/// The clock counts simulated time that the user can offset with the
/// +/- controls, and each station's altimeter/METAR is regenerated with a
/// random altimeter setting whenever the (simulated) hour changes.
final class ClockModel: ObservableObject {
    struct Station: Identifiable {
        let id: String
        var altimeterLastThree: String = ""
        var metar: String = ""
    }

    @Published private(set) var hour = 0
    @Published private(set) var minute = 0
    @Published private(set) var second = 0
    @Published private(set) var isPaused = false
    @Published private(set) var stations = [
        Station(id: "JAN"),
        Station(id: "GWO"),
        Station(id: "MLU"),
        Station(id: "VKS"),
    ]

    private var timer: Timer?

    var timeString: String {
        String(format: "%02d:%02d:%02d", hour, minute, second)
    }

    init() {
        useCurrentTime()
        let timer = Timer(timeInterval: 1, repeats: true) { [weak self] _ in
            self?.tick()
        }
        // .common keeps the clock ticking while the user scrolls.
        RunLoop.main.add(timer, forMode: .common)
        self.timer = timer
    }

    deinit {
        timer?.invalidate()
    }

    func useCurrentTime() {
        let now = Calendar.current.dateComponents([.hour, .minute, .second], from: Date())
        hour = now.hour ?? 0
        minute = now.minute ?? 0
        second = now.second ?? 0
        updateAltimeters()
        start()
    }

    func start() {
        isPaused = false
    }

    func pause() {
        isPaused = true
    }

    /// Snaps back to the top of the current minute (or the previous minute if
    /// already there) and pauses, matching the website's << button.
    func rewind() {
        if second == 0 {
            decrementMinute()
        } else {
            second = 0
        }
        pause()
    }

    func incrementMinute() {
        minute += 1
        if minute > 59 {
            minute = 0
            incrementHour()
        }
    }

    func decrementMinute() {
        minute -= 1
        if minute < 0 {
            minute = 59
            decrementHour()
        }
    }

    func incrementTenMinutes() {
        for _ in 0..<10 { incrementMinute() }
    }

    func decrementTenMinutes() {
        for _ in 0..<10 { decrementMinute() }
    }

    func incrementHour() {
        hour += 1
        if hour > 23 {
            hour = 0
        }
        updateAltimeters()
    }

    func decrementHour() {
        hour -= 1
        if hour < 0 {
            hour = 23
        }
        updateAltimeters()
    }

    private func tick() {
        guard !isPaused else { return }
        second += 1
        if second > 59 {
            second = 0
            incrementMinute()
        }
    }

    private func updateAltimeters() {
        for index in stations.indices {
            let altimeter = 2980 + Int.random(in: 0..<25)
            let id = stations[index].id
            stations[index].altimeterLastThree = String(String(altimeter).dropFirst())
            stations[index].metar = String(
                format: "%@ %02d00Z AUTO 35008KT 10SM CLR 27/21 A%d", id, hour, altimeter
            )
        }
    }
}
