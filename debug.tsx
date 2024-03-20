import { Button, Modal, ScrollView, Text } from "react-native";
type Props = {
  onPress: () => void;
  messages: string[];
};
export function DebugModal({ messages, onPress }: Props) {
  return (
    <Modal visible={true}>
      <ScrollView>
        {messages.map((message, i) => (
          <Text key={i}>{message}</Text>
        ))}
      </ScrollView>
      <Button onPress={onPress} title="Close" />
    </Modal>
  );
}
