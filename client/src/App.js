import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import logo from '../src/images/logo.png';
import Chat from './Chat';

const socket = io.connect("https://stranger-chat-app-server.vercel.app"); // Update to deployed server URL

const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");  // State for error message

  // Function to join a chat room
  const joinChat = () => {
    if (username.length < 4) {
      setErrorMessage("Username should be 4 or more characters long");
    } else if (room === "") {
      setErrorMessage("Room ID cannot be empty");
    } else {
      setErrorMessage("");  // Clear error message if everything is valid
      socket.emit("join_room", { username, room });
      setShowChat(true);
    }
  };

  // Leave chat function
  const leaveChat = () => {
    socket.emit("leave_room", { username, room });
    setShowChat(false);
  };

  // Listen for updates to the online users list
  useEffect(() => {
    socket.on("update_users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("update_users");
    };
  }, []);

  return (
    <>
      {
        !showChat && (
          <div className='min-h-screen flex flex-col justify-center items-center bg-white px-4'>
            <img src={logo} alt='logo' className='w-24 h-24 md:w-32 md:h-32 mb-4' />
            <h1 className='text-2xl md:text-4xl font-bold text-black mb-6 md:mb-10'>Stranger Chat</h1>

            <input
              className='mb-4 px-3 py-2 md:px-4 md:py-3 w-full max-w-64 md:max-w-xs rounded-full placeholder:px-2 border placeholder:text-sm md:placeholder:text-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              type="text"
              placeholder='Enter Your Name'
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className='mb-6 px-3 py-2 md:px-4 md:py-3 w-full max-w-64 placeholder:px-2 md:max-w-xs rounded-full border placeholder:text-sm md:placeholder:text-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              type="text"
              placeholder='Enter Room Id'
              onChange={(e) => setRoom(e.target.value)}
            />

            <div
              className={`absolute bottom-0 mb-16 bg-white text-black border border-red-500 rounded-md px-4 py-2 transition-opacity duration-300 
                            ${errorMessage ? "visible opacity-100" : "invisible opacity-0"}`}
            >
              {errorMessage}
            </div>

            <button
              className='px-8 md:px-12 py-2 text-lg font-semibold font-sans bg-skyblue rounded-full text-white'
              onClick={joinChat}>
              SIGN IN
            </button>
          </div>
        )
      }

      {
        showChat && (
          <Chat socket={socket} username={username} room={room} leaveChat={leaveChat} onlineUsers={onlineUsers} setShowChat={setShowChat} />
        )
      }
    </>
  );
}

export default App;
