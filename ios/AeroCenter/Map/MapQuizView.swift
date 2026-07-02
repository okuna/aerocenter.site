import SwiftUI

/// Native port of the interactive map quiz (map/index.html + map/src.js):
/// the map raster with 174 text fields positioned over it, the airspace
/// sector overlay, and the Fill/Reset/Hint/Check/Autocorrect toolbar.
struct MapQuizView: View {
    @StateObject private var model = MapQuizModel()

    var body: some View {
        VStack(spacing: 0) {
            toolbar
            Divider()
            ZoomableScrollView(contentSize: CGSize(width: model.data.width, height: model.data.height)) {
                canvas
            }
        }
    }

    private var toolbar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack {
                Button("Fill Answers") { model.fillAnswers() }
                Button("Reset") { model.reset() }
                Button("Toggle Airspace") { model.showSectors.toggle() }
                Button("Hint!") { model.hint() }
                Button("Check Answers") { model.checkAll() }
                Toggle("Autocorrect", isOn: $model.autocorrect)
                    .toggleStyle(.button)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.small)
            .padding(8)
        }
    }

    private var canvas: some View {
        ZStack(alignment: .topLeading) {
            Image(uiImage: model.mapImage)
                .resizable()
                .frame(width: model.data.width, height: model.data.height)
            if model.showSectors {
                ForEach(Array(model.data.sectors.enumerated()), id: \.offset) { _, sector in
                    SectorLabelView(sector: sector)
                        .offset(x: sector.x, y: sector.y)
                }
            }
            ForEach($model.entries) { $entry in
                QuizInputField(entry: $entry) {
                    model.entryEdited(entry.id)
                }
            }
        }
        .frame(width: model.data.width, height: model.data.height)
    }
}

private struct QuizInputField: View {
    @Binding var entry: MapQuizModel.Entry
    let onEdit: () -> Void

    var body: some View {
        TextField(placeholder, text: $entry.text)
            .textFieldStyle(.plain)
            .font(.system(size: 13))
            .multilineTextAlignment(textAlignment)
            .textInputAutocapitalization(.characters)
            .autocorrectionDisabled()
            .keyboardType(isNumeric ? .numberPad : .asciiCapable)
            .foregroundColor(textColor)
            .disabled(entry.isLocked)
            .frame(width: width)
            .background(entry.isWrong ? Color.yellow.opacity(0.5) : Color.clear)
            .rotationEffect(.degrees(entry.item.rotation))
            .position(x: entry.item.x, y: entry.item.y)
            .onChange(of: entry.text) { _ in onEdit() }
    }

    private var placeholder: String {
        switch entry.item.type {
        case .label: return "ABC"
        case .airway: return "V00"
        case .vorDegree: return "000"
        case .boundary: return "00"
        }
    }

    // Same widths as the website's .labelText (50pt) and .vorDegree (25pt)
    // CSS classes, converted to px.
    private var width: CGFloat {
        switch entry.item.type {
        case .label, .airway: return 67
        case .vorDegree, .boundary: return 34
        }
    }

    private var isNumeric: Bool {
        switch entry.item.type {
        case .vorDegree, .boundary: return true
        case .label, .airway: return false
        }
    }

    private var textAlignment: TextAlignment {
        switch entry.item.align {
        case .leading: return .leading
        case .center: return .center
        case .trailing: return .trailing
        }
    }

    private var textColor: Color {
        if entry.isLocked {
            return Color(red: 0x05 / 255, green: 0x5A / 255, blue: 0)
        }
        return entry.isWrong ? .red : .black
    }
}

private struct SectorLabelView: View {
    let sector: MapQuizData.Sector

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(sector.lines.enumerated()), id: \.offset) { index, line in
                Text(line)
                    .underline(index == 0 && sector.underlineFirst)
            }
        }
        .font(.system(size: 10))
        .foregroundColor(color)
        .fixedSize()
    }

    private var color: Color {
        switch sector.color {
        case "green": return Color(red: 0, green: 0.5, blue: 0)
        case "red": return .red
        default: return .black
        }
    }
}

#Preview {
    MapQuizView()
}
