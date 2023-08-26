import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea
} from '@chakra-ui/react';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { Client, PrivateKey } from '@hiveio/dhive';

import PostHeader from './postHeader';
import PostFooter from './modalFooter';
import Comments from './comments';
import voteOnContent from '../../api/voting';
import useAuthUser from '../../api/useAuthUser';
import CommentBox from './commentBox';
import { MarkdownRenderers } from './MarkdownRenderers';
import * as Types from '../types';

const nodes = [
  "https://rpc.ecency.com",
  "https://api.deathwing.me",
  "https://api.hive.blog",
  "https://api.openhive.network",
  "https://api.hive.blog",
  "https://anyx.io",
  "https://api.pharesim.me",
];

const PostModal: React.FC<Types.PostModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  author,
  permlink,
  weight,
  comments = []
}) => {
  
  const avatarUrl = `https://images.ecency.com/webp/u/${author}/avatar/small`;
  const { user } = useAuthUser();
  const username = user ? user.name : null
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [client, setClient] = useState(new Client(nodes[0]));
  const [nodeIndex, setNodeIndex] = useState(0);
  // Transform the content for 3speak videos
  content = transform3SpeakContent(content);

  function transform3SpeakContent(content: any) {
    const regex = /\[!\[\]\((https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/[a-zA-Z0-9]+\/)\)\]\((https:\/\/3speak\.tv\/watch\?v=([a-zA-Z0-9]+\/[a-zA-Z0-9]+))\)/;
    const match = content.match(regex);
    if (match) {
      const videoURL = match[2];
      const videoID = match[3];
      const iframe = `<iframe width="560" height="315" src="https://3speak.tv/embed?v=${videoID}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      content = content.replace(regex, iframe);
    }
    return content;
  }

  // Edit button handler
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Save edited content handler
  const handleSaveClick = () => {
    // TODO: Implement the logic to save the edited content to Hive
    // I want to check the body of content that is being saved using a console.log but I don't know how to do it
    console.log(editedContent)
    const username = user?.name; // Get the username from the authenticated user
    // get post details that wont change from Feed component and pass it to this component like permlink, tags, title, etc
    console.log(title)
    console.log(permlink)
    console.log(author)
        // Ok we are getting the edited content now we have to save it to the blockchain, lets do in the same way we do with the upload function in upload folder   
    if (username && window.hive_keychain) {

      const operations = [
        ["comment",
                  {
                      "parent_author": author,
                      "parent_permlink": "hive-173115",
                      "author": username,
                      "permlink": permlink,
                      "title": title,
                      "body": editedContent,
                      "json_metadata": JSON.stringify({
                          app: "skatehive",
                      })
                  }
              ],
      ];
      window.hive_keychain
      .requestBroadcast(username, operations, "posting")
      .then((response:any) => {
        if (response.success) {
          setIsEditing(false);
          setEditedContent(editedContent); // Update state after successful broadcast
        } else {
          console.error("Error updating the post:", response.message);
          // Handle the error further or show an error message
        }
      })
      .catch((error:any) => {
        console.error("Error during broadcasting:", error);
        // Handle the error or log it for further investigation
      });
  } else {
    console.error("Hive Keychain extension not found or user not authenticated!");
  }

  setIsEditing(false);
};

  // Cancel edit handler
  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedContent(content); // Reset to original content
  };  
  
  function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
  };

  const handleSaveEdit = () => {
    const username = user?.name; // Get the username from the authenticated user
    if (username && window.hive_keychain) {
      const permlink = slugify(title.toLowerCase()); // Generate the permlink from the title
      const operations = [
        [
          "comment",
          {
            parent_author: "", // Provide the correct parent author
            parent_permlink: "your-tag", // Replace with the correct parent permlink
            author: username,
            permlink: permlink,
            title: title,
            body: editedContent,
            json_metadata: JSON.stringify({ tags: ['your-tags'] }), // Update with the correct metadata
          },
        ],
      ];
  
      window.hive_keychain.requestBroadcast(username, operations, "posting", (response: any) => {
        if (response.success) {
          setIsEditing(false);
          // Update the content in the UI
          content = editedContent;
        } else {
          console.error('Error updating the post:', response.message);
        }
      });
    } else {
      console.error("Hive Keychain extension not found or user not authenticated!");
    }
  };
  

  

 
//  ---------------------------------------Scroll Effect -------------------------------
  const [userScrolled, setUserScrolled] = useState(false);

  const handleScroll = () => {
    const isAtBottom =
      modalContainerRef.current!.scrollTop >=
      (modalContainerRef.current!.scrollHeight || 0) - (modalContainerRef.current!.offsetHeight || 0);
    setUserScrolled(!isAtBottom);
  };
  const [charactersToShow, setCharactersToShow] = useState(0); // Start from 0

  useEffect(() => {
    const timer = setInterval(() => {
      setCharactersToShow((prevChars) => {
        if (prevChars >= content.length) {
          clearInterval(timer);
          return prevChars;
        } else if (prevChars < 400) { // Scroll effect for the first 300 characters
          return prevChars + 1;
        } else { // Display the entire content after the scroll effect
          clearInterval(timer);
          return content.length;
        }
      });
    }, 5);
  
    return () => clearInterval(timer);
  }, [content]);
  
  

  useEffect(() => {
    if (modalContainerRef.current && !userScrolled) {
      modalContainerRef.current.scrollTop = modalContainerRef.current.scrollHeight;
    }
  }, [charactersToShow, userScrolled]);

//  ---------------------------------------Scroll Effect -------------------------------

//  ---------------------------------------Voting Button -------------------------------

  const [sliderValue, setSliderValue] = useState(0);
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
};
  const handleVote = async () => {
    if (!user || !user.name) {  // Use user.name to get the username
        console.error("Username is missing");
        return;
    }

    try {
      await voteOnContent(user.name, permlink, author, sliderValue);
      // Optionally, update the UI to reflect the new vote count or state
    } catch (error) {
        console.error("Error voting:", error);
        // Optionally, show an error message to the user
    }
};

//  ---------------------------------------Voting Button -------------------------------
//  ---------------------------------------Comment Button -------------------------------
  const [commentPosted, setCommentPosted] = useState(false);
  const [commentsKey, setCommentsKey] = useState<number>(Date.now());
  const handleNewComment = () => {
    setCommentsKey(Date.now());
  };

//  ---------------------------------------Comment Button -------------------------------


return (
  <Modal isOpen={isOpen} onClose={onClose} size="xl">
    <ModalOverlay />
    <ModalContent backgroundColor={'black'} border={'1px solid white'}>
      <ModalHeader>
        <PostHeader title={title} author={author} avatarUrl={avatarUrl} onClose={onClose} />
        {user?.name === author && !isEditing && (
          <Button onClick={handleEditClick}>Edit</Button>
        )}
        {isEditing && (
          <Button onClick={handleSaveClick}>Save</Button>
        )}
      </ModalHeader>
      <ModalBody ref={modalContainerRef} onScroll={handleScroll}>
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        ) : (
          <ReactMarkdown
            children={charactersToShow >= content.length ? content : content.slice(0, charactersToShow)}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={MarkdownRenderers}
          />
        )}
      </ModalBody>
      <Comments comments={comments} commentPosted={commentPosted} />
      <CommentBox
        user={user}
        parentAuthor={author}
        parentPermlink={permlink}
        onCommentPosted={() => setCommentPosted(!commentPosted)}
      />
      <PostFooter onClose={onClose} user={user} author={author} permlink={permlink} weight={weight} />
    </ModalContent>
  </Modal>
);
};

export default PostModal;
