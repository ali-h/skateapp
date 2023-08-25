import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Text,
  Spacer,
  Tabs,
  TabList,
  Tab,
  TabProps,
  useBreakpointValue,
  Image,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Select,
  Divider,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { keyframes } from "@emotion/react";


//@ts-ignore
//import { Pioneer } from "pioneer-react";
import { Link, LinkProps as RouterLinkProps } from "react-router-dom";
import useAuthUser from "lib/pages/home/api/useAuthUser";
import HiveLogin from "lib/pages/home/api/HiveLoginModal";

const PROJECT_NAME = "Skatehive";

// Custom LinkTab component
type LinkTabProps = TabProps & RouterLinkProps;

interface User {
  name?: string;
  avatar?: string;
}

const LinkTab: React.FC<LinkTabProps> = ({ to, children, ...tabProps }) => (
  <Link to={to}>
    <Tab {...tabProps}>{children}</Tab>
  </Link>
);

const HeaderNew = () => {
  const fontSize = useBreakpointValue({ base: "2xl", md: "3xl" });
  const tabSize = useBreakpointValue({ base: "sm", md: "md" });
  const flexDirection = useBreakpointValue<"row" | "column">({ base: "column", md: "column" });
  const DEFAULT_AVATAR_URL = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTZrYmdtbGpjaXg4NzVheDNzOTY0aTZ0NjhvMDkwcnFpdmFnazhrNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/H39AnU3gTYgPm/giphy.gif";

  const { user, loginWithHive, logout, isLoggedIn } = useAuthUser();
  const [isModalOpen, setModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [user]);

  const handleConnectHive = () => {
    if (loggedIn) {
      logout();
    } else {
      setModalOpen(true);
    }
};


  const avatarUrl = user ? `https://images.hive.blog/u/${user.name}/avatar` : DEFAULT_AVATAR_URL;
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === "profile") {
      window.location.href = "/profile"; // Navigate to profile page
    } else if (selectedValue === "logout") {
      logout();
    }
  };



const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.8);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 255, 0, 2);
  }
  100% {
    box-shadow: 0 0 5px rgba(0, 255, 0, 0.8);
  }
`;
const enlargeOnHover = keyframes`
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.1);
    }
  `;
  const moveUpAndDown = keyframes`
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  `;

  return (
    <Flex
      as="header"
      direction={flexDirection}
      alignItems="center"
      justifyContent="space-between"
      p={6}
      bg="black"
      border="1px solid white"
      position="relative"
      borderRadius="10px"
    >
      <Flex width="100%" justifyContent="center" alignItems="center" mb={{ base: 2, md: 0 }}>
      <Menu>
      <MenuButton
  as={Button}
  backgroundColor="black"
  border="white 1px solid"
  color="white"
  size="l"
  css={{
    animation: `${glow} 2s infinite alternate , ${moveUpAndDown} 3s infinite` ,
    "&:hover": {
      animation: `${enlargeOnHover} 0.2s forwards, ${glow} 2s infinite alternate,${moveUpAndDown} 0s infinite`,
    },
  }}
>
  <Image
    src="https://i.ibb.co/4mnD3LP/image.png"
    alt="Dropdown Image"
    boxSize="48px" // Adjust the size as needed
    borderRadius="10px"
  />
</MenuButton>
<MenuList border="1px solid red" backgroundColor="black" color="white">
  <Link to="https://snapshot.org/#/skatehive.eth" style={{ textDecoration: 'none' }}>
    <MenuItem
      _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
      backgroundColor="black"
    >
      Comprar Meias
    </MenuItem>
  </Link>
  <Link to="https://hive.vote/dash.php?i=1&trail=steemskate" style={{ textDecoration: 'none' }}>
    <MenuItem
      _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
      backgroundColor="black"
    >
      Instagram
    </MenuItem>
  </Link>
  <Link to="https://www.stoken.quest/" style={{ textDecoration: 'none' }}>
    <MenuItem
      _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
      backgroundColor="black"
    >
      Quest For Stoken
    </MenuItem>
  </Link>
  <Link to="https://docs.skatehive.app" style={{ textDecoration: 'none' }}>
    <MenuItem
      _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
      backgroundColor="black"
    >
      Docs
    </MenuItem>
  </Link>
  <Link to="/becool" style={{ textDecoration: 'none' }}>
    <MenuItem
      _hover={{ backgroundColor: 'white', color: 'black' }} // Invert colors on hover
      backgroundColor="black"
    >
      How to be Cool
    </MenuItem>
  </Link>
  {/* Add more external links as needed */}
</MenuList>

        </Menu>
      <Text 
        fontSize={fontSize} 
        fontWeight="medium" 
        color="#f0c33f" 
        style={{ marginTop: '2px' }}
      >
      </Text>
      <Spacer />
      {/* Dropdown button */}

    
  </Flex>

      {/* Tabs centered horizontally */}
      <Tabs
  variant="soft-rounded"
  colorScheme="whiteAlpha"
  position={{ base: "relative", md: "absolute" }}
  left="50%"
  bottom={0}
  transform="translateX(-50%)"
  size={tabSize}
  mb={6}
  css={{
    border: "2px solid white",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
  <TabList display="flex" alignItems="center">
    <LinkTab to="/">Home</LinkTab>
    {loggedIn && <LinkTab to="/upload">Upload</LinkTab>} {/* Conditionally render Upload tab */}
    {loggedIn && <LinkTab to="/wallet">Wallet</LinkTab>} {/* Conditionally render Wallet tab */}
    {loggedIn ? (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Avatar 
          src={avatarUrl} 
          size="sm" 
          mr={2} 
          w="24px"
          h="24px"
        />
        <Select 
          value="" 
          onChange={handleSelectChange}
          style={{
            backgroundColor: 'black',
            color: 'white',
            border: 'none',  
            cursor: 'pointer'
          }}
        >
          <option value="" disabled selected>
            {user?.name}
          </option>
          <option value="profile">Profile</option>
          <option value="logout">Log out</option>
        </Select>
      </div>
    ) : (
      <Tab onClick={() => setModalOpen(true)}>
        Log in 
      </Tab>
    )}
  </TabList>
</Tabs>
      {/* Hive Login Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <HiveLogin isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </Modal>   
   </Flex>
  );
};

export default HeaderNew;
