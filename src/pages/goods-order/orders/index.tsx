import StreamChatModal from "@/components/StreamChatModal";
import { useState } from "react";

const questionList = [
  "常见的感冒症状有哪些？",
  "如何预防感冒？",
  "感冒了应该吃什么药？",
  "感冒了应该怎么治疗？",
  "感冒了应该怎么护理？",
  "感冒了应该怎么预防？",
  "感冒了应该怎么治疗？",
  "左氧氟沙星片是治疗什么病的？",
  "左手麻痹是什么原因？",
  "左手麻痹应该怎么治疗？",
  "左手麻痹应该怎么护理？",
  "左手麻痹应该怎么预防？",
];

const Index = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const handleOpen = (question: string) => {
    setCurrentQuestion(question);
    setModalVisible(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <h3>常见问题列表</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {questionList.map((q, idx) => (
          <li key={idx} style={{ marginBottom: 12 }}>
            <a onClick={() => handleOpen(q)}>{q}</a>
          </li>
        ))}
      </ul>
      <StreamChatModal
        key={currentQuestion}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        defaultRole="医疗顾问"
        defaultQuestion={currentQuestion}
        apiUrl="http://localhost:3000/api/stream-chat"
        onSuccess={(msg) => console.log("AI回复完成", msg)}
        onError={(err) => console.log("出错: " + err.message)}
        onAbort={() => console.log("已中断")}
        onMessage={(msg) => console.log("流式片段", msg)}
        onMinimize={(min) => console.log("最小化状态", min)}
      />
    </div>
  );
};
export default Index;
