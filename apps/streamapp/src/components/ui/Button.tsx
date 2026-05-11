import { Text, TouchableOpacity } from "react-native";

export default function Button({ title, className = "" }) {
  return (
    <TouchableOpacity
      className={`bg-primary py-4 rounded-xl items-center ${className}`}
    >
      <Text className="text-white font-semibold">{title}</Text>
    </TouchableOpacity>
  );
}
