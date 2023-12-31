import React, { useEffect, useState,useRef } from "react";
import { Col } from "react-bootstrap";
import ChatInput from "./ChatInput";
import { sendMessagesRouter, getALLMessagesRouter ,deleteMessageRouter} from "../utils/ApiRoutes";
import axios from "axios";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from 'react-toastify';


function ChatContainer({ currentUser, currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

   // CSS of toast 
   const toastCSS = {
    position:"top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  }

  useEffect(() => {
    if (currentChat) {
      (async () => {
        const response = await axios.post(getALLMessagesRouter, {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      })();
    }
  }, [currentChat]);


  const setNewMessage=async(res,msg)=>{
    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg, id: res.data.msgId });
    setMessages(msgs);
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });
  }
  const handleSendMsg = async(msg) => {
    const res =  await axios.post(sendMessagesRouter, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });
    const msgs = await setNewMessage(res,msg);
    
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behaviour: "smooth" });
  }, [messages]);

  const handleDelete= async(id)=>{
    const res = await axios.delete(deleteMessageRouter,{data:{id:id}});
    if(res.data.status){
      const response = await axios.post(getALLMessagesRouter, {
        from: currentUser._id,
        to: currentChat._id,
      });
      toast.warn(res.data.msg, toastCSS);
      setMessages(response.data);
    }
    else
      toast.error(res.data.msg,toastCSS);
  }

  return (
    <>
      <ChatHeader className="row user-details bg-dark d-flex user-details p-1 align-items-center m-0">
        <Col className="avatar pe-0" sm="1">
          {/* <img src={`data:image/svg+xml;base64,${currentChat.avataarImage}`} alt="avatar" /> */}
          <img
           src={`data:image/svg+xml;base64,${currentChat.avataarImage}`}
            className="rounded-circle"
            alt="avatar"
          />
        </Col>
        <Col className="user-name text-capitalize" sm="11"> 
          <h3> {currentChat.userName}</h3>
        </Col>
      </ChatHeader>

      <ChatMessages className="chat-messages me-0 ms-0">
        {messages.map((msg) => {
          return (
          <div ref={scrollRef} key={uuidv4()} className={`d-flex ${msg.fromSelf ? "sender" : "recieved"}`}>
            {
            !(msg.fromSelf) &&
            <img
            src={`data:image/svg+xml;base64,${currentChat.avataarImage}`}
            className="rounded-circle align-self-center me-1 " style={{width:"35px",height:"35px"}}
            alt="avatar"
            />}
            <div className={`message ${msg.fromSelf ? "sender" : "recieved"}`}>
              { (msg.fromSelf)? <div className="delete">
              <i class="fa-solid fa-trash" onClick={()=>handleDelete(msg.id)}></i> </div> : ""}
              <div className="content">
                <p className="m-0">{msg.message}</p>
              </div>
            </div>
            {msg.fromSelf && <img
            // src="https://i.pinimg.com/236x/b4/b5/40/b4b5408801fdd5bc55749d6a102c759b.jpg"
            src={`data:image/svg+xml;base64,${currentUser.avataarImage}`}
            className="rounded-circle align-self-center ms-1 " style={{width:"35px",height:"35px"}}
            alt="avatar"
            />}
          </div>
          );
        })}
      </ChatMessages>
      <ChatInput handleSendMsg={handleSendMsg} />
      <ToastContainer />
    </>
  );
}

const ChatHeader = styled.div`
  height: 11%;
  .avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 6.5%;
    height: 4.5rem;
    img {
      width: 50px;
      height: 50px;
    }
  }
  .user-name {
    color: white;
  }
`;
const ChatMessages = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 21%);
  overflow: auto;
  gap: 1rem;
  padding: 1rem;
  background:   #282a36;   //#d6cbde;
  .message {
    display: flex;
    align-items: center;
    .content {
     // max-width: 40%;
      overflow-wrap: break-word;
      padding: 0.5rem 1rem;
      font-size: 1.1rem;
      border-radius: 1rem;
      color: white;
    }
    .delete{
        .fa-solid{
        color:transparent;
        margin:6px;
        }
    }
  }
  .message:hover{
    .delete{
        .fa-solid{
        color:white;
        cursor:pointer
        }
    }
  }
  .sender {
    justify-content: flex-end;
    .content {
      ${"" /* background:#443C68; */}
      ${'' /* background:#443c68cc; */}
      background:#473a5e;
    }
  }
  .recieved {
    justify-content: flex-start;
    .content {
      background: #393053;
    }
  }
`;

export default ChatContainer;
