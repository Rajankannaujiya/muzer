/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, PlusIcon, ShareIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Appbar from "./Appbar";
import YouTubePlayer from "youtube-player"
import Image from "next/image";
import { usePathname } from "next/navigation";


interface Song {
  id: number;
  title: string;
  extractedId: string;
  upvotes: number;
  haveUpvoted: boolean;
  userId: string;
  smallImg: string;
  bigImg: string;
}

const REFRESH_INTERVAL = 10 * 1000

export default function StreamView({
    creatorId,
    playVideo =false
}:{
    creatorId:string;
    playVideo: boolean
}) {
//   const creatorId = "a9e119bf-4d1c-42f6-b096-17a02ae0b5e2";

  const [songs, setSongs] = useState<Song[]>([]);
  const [newSongLink, setNewSongLink] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [playnextLoader, setPlayNextLoader] = useState(false);
  const [pathName, setPathName] = useState(false);

const path = usePathname();
console.log(path);


  useEffect(() => {
    if (!currentlyPlaying && songs.length > 0) {
      setCurrentlyPlaying(songs[0]);
      setSongs(songs.slice(1));
    }
  }, [songs, currentlyPlaying]);


const videoPlayerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if(path==="/dashbord"){
    setPathName(true);
  }
  if (!videoPlayerRef.current || !currentlyPlaying) {
    return;
  }

  console.log("videoRef",videoPlayerRef)
  const player = YouTubePlayer(videoPlayerRef.current!);

  // 'loadVideoById' is queued until the player is ready to receive API calls.
  player.loadVideoById(currentlyPlaying?.extractedId);

  // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.
  player.playVideo();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function eventHandler(event: any) {
    console.log(event);
    console.log(event.data);
    if (event.data === 0) {
      playNextVideo();
    }
  }
  player.on("stateChange", eventHandler);
  return () => {
    player.destroy();
  };
}, [currentlyPlaying,videoPlayerRef]);



  // console.log("this is the current song",currentlyPlaying, currentlyPlaying?.extractedId);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
          method: "GET",
        });
        const data = await res.json();
        console.log("the songs are", data);
    
        setSongs(data.streams.sort((a: { upvotes: number; }, b: { upvotes: number; }) => b.upvotes - a.upvotes));
        const newPlaying =
        data?.activeStreams?.stream || data?.streams?.[0] || null;

      if (newPlaying && (!currentlyPlaying || currentlyPlaying.id !== newPlaying.id)) {
        setCurrentlyPlaying(newPlaying);
      }
  
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };
  
    // Call the function immediately on mount
    fetchSongs();
  
    // Set up the interval to call the function repeatedly
    const intervalId = setInterval(() => {
      fetchSongs();
    }, REFRESH_INTERVAL); // Replace with your desired interval in ms
  
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [creatorId, setSongs,currentlyPlaying]); // Ensure creatorId is included in dependencies


  const playNextVideo = async() =>{
    if(songs.length>0){
    try {
      setPlayNextLoader(true);
      const data = await fetch("/api/streams/next/",{
        method:'GET',
      })
      
      console.log("this is the data",await data.json())
      const json  = await data.json();
      setCurrentlyPlaying(json.streams);
      setSongs(s=>s.filter(x=>x.id !==json.streams?.id));
    }
   catch (error) {
    console.log("Error while playing next Video");
  }
  setPlayNextLoader(false);
}

  }

  const handleAddSong = async () => {
    setLoading(true);
    const youtubeId = extractYoutubeId(newSongLink);
    if (youtubeId) {
      const newSong = await fetch("/api/streams/", {
        method: "POST",
        body: JSON.stringify({
          creatorId:creatorId,
          url: newSongLink,
        }),
      });
      setSongs([...songs, await newSong.json()]);
      setLoading(false);
      setNewSongLink("");
    } else {
      setLoading(false);
      toast.error("Error! Invalid YoutubeId");
    }
  };

  const handleVote = async (id: number, isUpvote: boolean) => {
    // Save the current state for rollback
    const previousSongs = [...songs];
  
    // Optimistic UI update
    setSongs(
      songs
        .map((song) =>
          song.id === id
            ? {
                ...song,
                upvotes: isUpvote ? song.upvotes + 1 : song.upvotes - 1,
                haveUpvoted: !song.haveUpvoted,
              }
            : song
        )
        .sort((a, b) => b.upvotes - a.upvotes)
    );
  
    try {
      const response = await fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streamId: id }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Vote result:", result);
    } catch (error) {
      console.error("Error during voting:", error);
      // Rollback on failure
      setSongs(previousSongs);
    }
  };
  
  

  const handleShare = () => {
    const shareUrl = `${window.location.hostname}/creator/${creatorId}`;
    console.log("sharable link", shareUrl);

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success(
          "Link Copied! The link to this page has been copied to your clipboard."
        );
      })
      .catch((error) => {
        console.error("Failed to copy link to clipboard: ", error);
        toast.error("Error! Failed to copy the link to the clipboard.");
      });
  };

  console.log("currently playing", currentlyPlaying, "video ref" ,videoPlayerRef)

  const extractYoutubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div >
     <div className="mb-4 p-4">
     <Appbar />
     </div>
  
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">
          Music Voting App
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-gray-100">
              
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 text-gray-100 hover:bg-gray-600"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentlyPlaying ? (
               <div>
                 <div>
                   <h3 className="font-semibold mb-2 text-gray-100">
                     {currentlyPlaying.title}
                   </h3>
                   <div className="aspect-video">
                   { playVideo ? (
                <>
                  {currentlyPlaying && <div ref={videoPlayerRef} className="w-full" />}
                </>
              ) : (
                <>
                  <Image
                    height={288}
                    width={288}
                    alt={currentlyPlaying?.bigImg}
                    src={currentlyPlaying?.bigImg}
                    className="h-72 w-full rounded object-cover"
                  />
                </>
              )}
                   </div>
                 </div>
             </div>
              ) : (
                <p className="text-gray-300">No song is currently playing.</p>
              )}

            {pathName && <Button onClick={playNextVideo}className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-5">{playnextLoader ? "Loading..." : "Play Next"}</Button>}

            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Add New Song</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  placeholder="Paste YouTube video link"
                  value={newSongLink}
                  onChange={(e) => setNewSongLink(e.target.value)}
                  className="bg-gray-700 text-gray-100 border-gray-600 focus:border-gray-500"
                />
                <Button
                  disabled={loading}
                  onClick={handleAddSong}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "" : <PlusIcon className="h-4 w-4 mr-2" />}
                  {loading ? "Loading..." : "Add to Queue"}
                </Button>
              </div>
              {newSongLink && extractYoutubeId(newSongLink) && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-gray-100">Preview:</h4>
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${extractYoutubeId(
                        newSongLink
                      )}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">
                Upcoming Songs Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {songs.length > 0 &&
                  songs.map((song) => (
                    <li
                      key={song.id}
                      className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-100">
                          {song.title}
                        </h3>
                        <div className="flex space-x-4 text-sm text-gray-400">
                          <span>Upvotes: {song.upvotes}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleVote(song.id, song.haveUpvoted ? false : true)
                          }
                          className="bg-gray-600 text-gray-100 hover:bg-gray-500"
                        >
                          {song.haveUpvoted ? (
                            <ArrowDownIcon className="h-4 w-4" />
                          ) : (
                            <ArrowUpIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </div>
  );
}
