import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import classes from "./Chat.module.css";
import _ from "lodash";
import Button from "../Button";
import moment from "moment";
import { makeRequest } from "../../axios";

const getRandomNumber = () => {
  const min = 0;
  const max = 100;
  // Check if inclusive (default) or exclusive
  const inclusive = max !== max - 1;

  if (inclusive) {
    // Generate random number between min and max (inclusive)
    return Math.random() * (max - min + 1) + min;
  } else {
    // Generate random number between min and max (exclusive)
    return Math.random() * (max - min) + min;
  }
};

const Chat = (props) => {
  const {
    socket,
    email,
    room,
    setShowChat,
    showBack = false,
    messageList = [],
    setMessageList,
    comp,
    incubator_id,
    startup_id,
    fetchChats,
  } = props;

  const [currentMessage, setCurrentMessage] = useState("");

  const handleSaveMessage = async ({
    incubator_id,
    startup_id,
    sender,
    message,
  }) => {
    try {
      const response = await makeRequest.post("chat/add-chat", {
        incubator_id,
        startup_id,
        sender,
        message,
      });

      if (response.status === 200) {
        const data = response.data;
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const addLastTime = async () => {
    try {
      const response = await makeRequest.post("chat/add-time", {
        incubator_id,
        startup_id,
        email,
        time: moment().format("YYYY-MM-DD HH:mm:ss"),
        type: "CHAT",
      });

      if (response.status === 200) {
        const data = response.data;
      } else {
        console.error("Error fetching data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        id: getRandomNumber(),
        room: room,
        sender: email,
        message: currentMessage,
        time: moment().format("YYYY-MM-DD HH:mm:ss"),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => _.uniqBy([...list, messageData], "id"));
      handleSaveMessage({
        id: getRandomNumber(),
        incubator_id,
        startup_id,
        sender: email,
        message: currentMessage,
      });
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => {
        return _.uniqBy([...list, data], "id");
      });
    });

    return async () => {
      await addLastTime();
      if (fetchChats) {
        fetchChats();
      }
    };
  }, [socket]);

  return (
    <div className={classes.chatWindow}>
      {showBack && (
        <div className={classes.chatHeader}>
          <Button
            name={"< Back"}
            onClick={() => {
              setShowChat(false);
            }}
            customStyles={{
              width: 80,
              fontSize: 16,
              color: "black",
              justifyContent: "left",
              backgroundColor: "#ffffff",
            }}
            variant={"soft"}
          />
          {comp}
        </div>
      )}
      <div
        className={classes.chatBody}
        style={showBack ? {} : { height: "calc(100% - 40px)" }}
      >
        <ScrollToBottom className={classes.messageContainer}>
          {messageList.map((messageContent) => {
            return (
              <div
                className={
                  email != messageContent.sender
                    ? classes.yourMessage
                    : classes.otherMessage
                }
              >
                <div className={classes.messageContentContainer}>
                  <div className={classes.messageContent}>
                    <p>{messageContent.message}</p>
                  </div>
                  <div className={classes.messageMeta}>
                    <p className={classes.time}>
                      {moment(messageContent.time).format("MMM D,HH:mm")}
                    </p>
                    <p className={classes.author}>
                      {_.first(_.split(messageContent.sender, "@"))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className={classes.chatFooter}>
        <input
          className={classes.inputField}
          type="text"
          value={currentMessage}
          placeholder="Type your message"
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage} className={classes.sendFooterText}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
