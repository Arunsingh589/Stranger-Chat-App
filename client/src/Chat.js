import React, { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaArrowRight, FaCircle, FaUserAlt } from "react-icons/fa";
import background from '../src/images/bg.jpg'
import { GoPaperAirplane } from "react-icons/go";
import { HiStatusOnline } from "react-icons/hi";

const Chat = ({ socket, username, room, leaveChat, onlineUsers, setShowChat }) => {
    const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("")
    const [messageList, setMessageList] = useState([]);


    const sendMsg = async () => {
        if (currentMessage !== "") {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0'); // Pad minutes with leading zeros
            const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM
            const formattedHours = (hours % 12) || 12; // Convert to 12-hour format, handling 0 as 12

            const messageData = {
                id: Math.random(),
                room: room,
                author: username,
                message: currentMessage,
                time: `${formattedHours}:${minutes} ${ampm}` // Example: 1:05 PM
            };

            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };


    useEffect(() => {
        const receiveMsg = (data) => {
            if (data.username === "System") {
                // Append system messages distinctly
                setMessageList((list) => [...list, {
                    id: data.id,
                    author: data.username,
                    message: data.message,
                    time: data.time,
                    isSystem: true // Mark this message as a system message
                }]);
            } else {
                // Regular user message
                setMessageList((list) => [...list, data]);
            }
        }
        socket.on("receive_message", receiveMsg);
        return () => {
            socket.off("receive_message", receiveMsg)
        }
    }, [socket])


    const toggleLeftPanel = () => {
        setIsLeftPanelVisible(!isLeftPanelVisible);
    };


    const lastMessageRef = useRef(null);

    // scrollIntoView:- When the messageList updates, useEffect triggers scrollIntoView({ behavior: 'smooth' })
    //  on the last message, smoothly scrolling the chat to the bottom.

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messageList]);


    return (
        <section className='h-full'>
            <nav className='w-full bg-black py-4'>
                <div className='flex justify-between px-4 md:px-6 items-center'>
                    <p className=' text-white text-[10px] sm:text-sm md:text-2xl'>Hangout with strangers</p>
                    <div className='flex space-x-4 md:space-x-4 items-center'>
                        <div className='flex items-center space-x-1 md:space-x-2'>
                            <FaUserAlt className='text-white text-[10px] sm:text-sm md:text-lg' />
                            <p className='text-white text-[10px] sm:text-sm md:text-lg '>{username}</p>
                        </div>

                        <button onClick={leaveChat} className='bg-[#1aa1f5] px-2 md:px-3 py-1 text-[10px] sm:text-sm font-sans md:text-lg text-white rounded-lg'>LEAVE CHAT</button>

                    </div>

                </div>
            </nav>

            <div className="w-full flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Left Section */}
                <div className='hidden  md:flex flex-col w-full md:w-[25%] h-full justify-start items-start pt-10 p-4 px-6 bg-gray-900 text-white'>
                    <p className='mb-4 md:mb-8 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl  text-skyblue'>Online Users</p>
                    {/* <p className='text-lg  md:text-2xl lg:text-3xl font-bold mb-4 md:mb-10'>Online Users</p> */}
                    {onlineUsers.map((user, index) => (
                        <div key={index} className='flex items-center px-1 py-1 md:px-2'>
                            <p className='text-xl font-semibold font-sans mr-2 flex'><span className='mr-3 font-sans'>{index + 1}.</span>{user.username}</p>
                            <HiStatusOnline className='text-green-500 text-lg md:text-xl ' /> {/* Green circle for online indicator */}
                        </div>
                    ))}

                </div>
                {/* Visible in small screen */}
                {/* Left Section */}
                <div className={`fixed inset-y-0 left-0  flex md:hidden flex-col w-[70%]  h-full justify-start items-start pt-10 p-4 px-6 bg-gray-900 text-white transition-transform duration-300 z-30 ${isLeftPanelVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <p className='mb-4 md:mb-8 font-bold text-2xl text-skyblue md:text-5xl'>Stranger Chat</p>
                    <p className='text-lg md:text-3xl font-bold mb-4 md:mb-10'>Online Users</p>
                    {onlineUsers.map((user, index) => (
                        <div key={index} className='flex items-center px-1 py-1 md:px-2'>
                            <p className='text-xl font-semibold font-sans mr-2 flex'><span className='mr-3 font-sans'>{index + 1}.</span>{user.username}</p>
                            <HiStatusOnline className='text-green-500 text-lg md:text-xl ' /> {/* Green circle for online indicator */}
                        </div>
                    ))}
                </div>

                {/* Toggle Arrow Button */}
                <button
                    className="absolute z-40 left-0 top-1/2 transform -translate-y-1/2 md:hidden bg-black text-white p-2 rounded-r-md"
                    onClick={toggleLeftPanel}>
                    {isLeftPanelVisible ? <FaArrowLeft /> : <FaArrowRight />}
                </button>

                {/* Right Section */}
                <div className='w-full md:w-[75%] relative flex h-full  justify-center items-center '>
                    <div className='absolute inset-0 bg-black opacity-50 z-10'></div>
                    <img src={background} className='w-full h-full object-cover z-0' alt="logo" />

                    {/* Message List */}
                    <div className='absolute inset-x-0 top-0 bottom-20 overflow-y-auto p-4 z-20 space-y-4 scrollbar'>
                        {messageList.map((data, index) => (
                            <div
                                key={data.id ? data.id : index}
                                ref={index === messageList.length - 1 ? lastMessageRef : null}
                                className={`flex ${data.isSystem ? 'justify-center' : (username === data.author ? 'justify-end' : 'justify-start')}`}>
                                <div className={`max-w-[70%] px-6 md:px-7 py-2 ${data.isSystem ? 'bg-[#128C7E] text-white text-center rounded-full' : (username === data.author ? 'bg-[#DCF8C6] text-black rounded-l-full' : 'bg-[#f2f0ed] rounded-r-full text-black')}`}>
                                    {/* Render message without author for system messages */}
                                    {data.isSystem ? (
                                        <p className="text-sm md:text-lg">{data.message}</p> // Centered system message
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-bold">{data.author}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-1 break-words whitespace-pre-wrap">
                                                <p className="text-sm md:text-lg flex-grow">{data.message}</p>
                                                <p className="text-[11px] ml-4 whitespace-nowrap mt-2">{data.time}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>






                    <div className='absolute bottom-0 w-full  flex justify-between items-center p-4 bg-white z-20'>
                        <input
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            type="text"
                            className='px-4 py-2 flex-grow text-black  text-xl placeholder:text-lg md:placeholder:text-xl placeholder:font-sans
                         focus:outline-none  border-b-4'
                            placeholder='Write Message'
                            onKeyPress={(e) => { e.key === "Enter" && sendMsg() }}
                        />
                        <button onClick={sendMsg} className='ml-4 px-3 md:px-5 py-2 text-[10px] lg:text-lg md:py-3 bg-[#1aa1f5] rounded-lg text-white'>SEND <GoPaperAirplane className='inline-block ml-1' /></button>
                    </div>


                </div>

            </div>
        </section >

    )
}

export default Chat
