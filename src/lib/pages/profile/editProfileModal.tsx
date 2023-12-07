import React, { useEffect, useState } from 'react';
import { Textarea, Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import { KeychainSDK, KeychainKeyTypes, Broadcast } from 'keychain-sdk';
import { css } from '@emotion/react';
import axios from 'axios';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_GATEWAY_TOKEN = process.env.PINATA_GATEWAY_TOKEN;

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
  const [name, setName] = useState<string>(user.profile?.name || '');
  const [about, setAbout] = useState<string>(user.profile?.about || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user.profile?.profile_image || '');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(user.profile?.cover_image || '');
  const [website, setWebsite] = useState<string>(user.profile?.website || '');
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (user && user.posting_json_metadata) {
      try {
        const metadata = JSON.parse(user.posting_json_metadata);
        setName(name => name || metadata.profile.name || '');
        setAbout(about => about || metadata.profile.about || '');
        setAvatarUrl(avatarUrl => avatarUrl || metadata.profile.profile_image || '');
        setCoverImageUrl(coverImageUrl => coverImageUrl || metadata.profile.cover_image || '');
        setWebsite(website => website || metadata.profile.website || '');
        console.log(metadata);
      } catch (error) {
        console.error('Error parsing JSON metadata:', error);
      }
    }
  }, [user]);

  const sendEditTransaction = async () => {
    try {
      const keychain = new KeychainSDK(window);

      const formParamsAsObject = {
        data: {
          username: user.name,
          operations: [
            [
              'account_update2',
              {
                account: user.name,
                json_metadata: '',
                posting_json_metadata: JSON.stringify({
                  profile: {
                    name: name,
                    about: about,
                    cover_image: coverImageUrl,
                    profile_image: avatarUrl,
                    website: website,
                  },
                }),
                extensions: [],
              },
            ],
          ],
          method: KeychainKeyTypes.active,
        },
      };

      const broadcast = await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);

    } catch (error) {
      console.error(error);
    }
  };

  const uploadFileToIPFS = async (file: File) => {
    try {
      if (file.type.startsWith("video/mp4")) {
        alert("Video file upload is not supported yet.");
      } else if (file.type.startsWith("image/")) {
        const formData = new FormData();
        formData.append("file", file);
        formData.set("Content-Type", "multipart/form-data");

        const response = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: {
              "pinata_api_key": PINATA_API_KEY,
              "pinata_secret_api_key": PINATA_API_SECRET,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE`;
          console.log(ipfsUrl);
          return ipfsUrl;
        } else {
          const errorData = await response.json();
          console.error("Error uploading image file to Pinata IPFS:", errorData);
        }
      } else {
        alert("Invalid file type. Only images are allowed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleProfileFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProfileFile(file);
      uploadFileToIPFS(file).then((ipfsUrl) => setAvatarUrl(ipfsUrl?.toString() || ''));
    }
  };

  const handleCoverFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      uploadFileToIPFS(file).then((ipfsUrl) => setCoverImageUrl(ipfsUrl?.toString() || ''));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={"black"} border={"1px solid limegreen"}>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text> Name</Text>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Text> About</Text>
          <Textarea
            placeholder="About"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            css={css`
              white-space: wrap;
              min-height: 150px;
            `}
          />
          <Text> Avatar URL</Text>
          <Input
            placeholder="Avatar URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
          <Text> Cover Image URL</Text>
          <Input
            placeholder="Cover Image URL"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
          />
          <Text> Website</Text>
          <Input
            placeholder="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <Button color={"limegreen"} border={"1px dashed limegreen"} variant="ghost">
            <label htmlFor="profileFileInput">Choose Profile Image</label>
            <input
              type="file"
              id="profileFileInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfileFileInputChange}
            />
          </Button>
          {selectedProfileFile && (
            <div>
              Selected Profile Image: {selectedProfileFile.name}
            </div>
          )}
          <Button color={"limegreen"} border={"1px dashed limegreen"} variant="ghost">
            <label htmlFor="coverFileInput">Choose Cover Image</label>
            <input
              type="file"
              id="coverFileInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleCoverFileInputChange}
            />
          </Button>
          {selectedCoverFile && (
            <div>
              Selected Cover Image: {selectedCoverFile.name}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button color={"limegreen"} border={"1px dashed limegreen"} onClick={sendEditTransaction} variant="ghost">
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;