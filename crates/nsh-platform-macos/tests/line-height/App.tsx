import { Input, mount, Scroll, signal, Text, View } from "nsh";

function App() {
  const height = signal(32);
  const value = signal("");
  const focus = signal(false);
  const caret = signal({ y: 0, height: 0 });
  const changes = signal(0);
  const selection = signal("0-0");
  const masked = signal(false);
  const otherHeight = signal(0);
  const multilineY = signal(0);
  const multilineChanges = signal(0);
  return (
    <Scroll class="flex-1 bg-white" contentClass="gap-3 p-6" keyboardShouldPersistTaps="handled">
      <Input
        testID="line"
        value={value()}
        masked={masked()}
        onChange={(text) => { value.set(text); changes.update((n) => n + 1); }}
        onFocus={() => focus.set(true)}
        onBlur={() => focus.set(false)}
        onSelectionChange={(e) => selection.set(`${e.start}-${e.end}`)}
        onCaretMove={(e) => caret.set({ y: e.bounds.origin.y, height: e.bounds.size.height })}
        placeholder="Placeholder"
        class="h-16 border px-3 text-black placeholder:text-gray-500"
        style={{ fontSize: 16, lineHeight: height() }}
      />
      <Text>{`Caret height: ${Math.round(caret().height)}`}</Text>
      <Text>{`Line height: ${height()}`}</Text>
      <Text>{`Caret center: ${Math.round(caret().y + caret().height / 2)}`}</Text>
      <Text>{`Focus: ${focus()}`}</Text>
      <Text>{`Value: ${value()}`}</Text>
      <Text>{`Changes: ${changes()}`}</Text>
      <Text>{`Selection: ${selection()}`}</Text>
      <View testID="height48" onPress={() => height.set(48)}><Text>Height 48</Text></View>
      <View testID="height16" onPress={() => height.set(16)}><Text>Height 16</Text></View>
      <View testID="height24" onPress={() => height.set(24)}><Text>Height 24</Text></View>
      <View testID="height32" onPress={() => height.set(32)}><Text>Height 32</Text></View>
      <View testID="natural" onPress={() => height.set(0)}><Text>Natural line height</Text></View>
      <View testID="replace" onPress={() => value.set("Replaced")}><Text>Replace value</Text></View>
      <View testID="mask" onPress={() => masked.set(!masked())}><Text>Toggle password</Text></View>
      <Input
        testID="other"
        placeholder="Another field"
        onCaretMove={(e) => otherHeight.set(e.bounds.size.height)}
        style={{ height: 48, fontSize: 16 }}
      />
      <Text>{`Other caret height: ${Math.round(otherHeight())}`}</Text>
      <Input
        testID="multiline"
        multiline
        class="border text-black placeholder:text-gray-500"
        placeholder={"First line\nSecond line"}
        onChange={() => multilineChanges.update((n) => n + 1)}
        onCaretMove={(e) => multilineY.set(e.bounds.origin.y)}
        style={{ height: 144, fontSize: 16, lineHeight: height() }}
      />
      <Text>{`Multiline caret y: ${Math.round(multilineY())}`}</Text>
      <Text>{`Multiline changes: ${multilineChanges()}`}</Text>
    </Scroll>
  );
}
mount(App);
