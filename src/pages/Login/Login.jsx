import {
  Box,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Container,
  Image,
} from "@chakra-ui/react";
import Cookies from "js-cookie";
import { useRef, useState, useEffect } from "react";
import { Auth } from "../../utils/Controllers/Auth";
import { useAuth } from "../../hooks/useAuth";
import { toastService } from "../../utils/toast";
import { useNavigate } from "react-router";

// ========== 1-USUL: Rasimni import qilish (ENG TO'G'RI) ==========
import logoImage from "../../../public/USD.jpg"; // Yo'lni tekshiring

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false); // Rasm yuklanmasa

  const passInput = useRef("");
  const logInput = useRef("");
  const [errors, setErrors] = useState({ login: "", password: "" });

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginText = logInput.current.value.trim();
    const password = passInput.current.value.trim();

    let newErrors = {};

    if (!loginText) {
      newErrors.login = "Login kiritilmadi";
    }

    if (!password) {
      newErrors.password = "Parol kiritilmadi";
    } else if (password.length < 6) {
      newErrors.password = "Parol kamida 6 belgidan iborat bo'lishi kerak";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;
    
    try {
      const payload = {
        username: logInput.current.value,
        password: passInput.current.value,
      };
      setLoading(true);
      const res = await Auth.Login(payload);
      
      if (res.status == 200 || res.status == 201) {
        const data = res.data;
        const userData = data.user || data.newUser;
        
        if (!userData) {
          toastService.error("Foydalanuvchi ma'lumotlari topilmadi");
          return;
        }
        
        login({
          token: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
          user: userData,
        });
        
        Cookies.set("token", data.tokens.access_token);
        Cookies.set("u_refresh_token", data.tokens.refresh_token);
        
        const role = userData.role;
        if (role === "admin") {
          navigate("/");
          toastService.success("Successfully");
        } else if (role === "super_admin") {
          navigate("/superadmin");
          toastService.success("Successfully, Welcome Boss !");
        } else if (role === "broker") {
          navigate("/operator/offers");
          toastService.success("Successfully");
        } else if (role === "operator") {
          navigate("/call-operator/company");
          toastService.success("Successfully");
        } else if (role === "supplier") {
          navigate("/supplier");
          toastService.success("Successfully");
        } else if (role === "lot_creator") {
          navigate("/lotcreator");
          toastService.success("Successfully");
        } else {
          toastService.error("Role mos kelmadi");
        }
      } else {
        toastService.error(res?.data?.message || "ok");
      }
    } catch (err) {
      console.log(err);
      if (err) {
        toastService.error(err?.response?.data?.message || "Tizim xatosi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="bg" px={4}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        w={{ base: "100%", sm: "400px" }}
        bg="surface"
        p={8}
        rounded="xl"
        shadow="lg"
      >
        {/* Logo qismi - 3 xil usul */}
        <Flex justify="center" mb={4}>
          <Box
            w="70px"
            h="70px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/* ========== 1-USUL: Import qilingan rasm (TAVSIYA ETILADI) ========== */}
            <Image
              src={logoImage}
              alt="USD currency"
              rounded="full"
              objectFit="cover"
              w="100%"
              h="100%"
              onError={() => setImageError(true)}
              fallbackSrc="https://via.placeholder.com/90x60?text=Logo"
            />

            {/* ========== 2-USUL: Public papkadan to'g'ri yo'l (agar 1-usul ishlamasa) ========== */}
            {/* 
            <Image
              src="/USD.jpg"
              alt="USD currency"
              rounded={6}
              objectFit="cover"
              w="100%"
              h="100%"
              onError={() => setImageError(true)}
              fallbackSrc="https://via.placeholder.com/90x60?text=Logo"
            />
            */}

            {/* ========== 3-USUL: Environment variable bilan (agar 1 va 2 ishlamasa) ========== */}
            {/* 
            <Image
              src={`${process.env.PUBLIC_URL}/USD.jpg`}
              alt="USD currency"
              rounded={6}
              objectFit="cover"
              w="100%"
              h="100%"
              onError={() => setImageError(true)}
              fallbackSrc="https://via.placeholder.com/90x60?text=Logo"
            />
            */}

            {/* ========== XATOLIK BO'LSA KO'RSATISH ========== */}
            {imageError && (
              <Text color="red.500" fontSize="xs" textAlign="center">
                Rasm yuklanmadi
              </Text>
            )}
          </Box>
        </Flex>

        <Heading textAlign="center" size="lg" mb={2} color="text">
          Tizimga kirish
        </Heading>

        <Text textAlign="center" color="gray.500" mb={6}>
          Tizimga kirish uchun ma'lumotlarni kiriting
        </Text>

        <FormControl mb={4} isInvalid={!!errors.login}>
          <FormLabel color="text">Login</FormLabel>
          <Input
            ref={logInput}
            placeholder="Loginni kiriting"
            onChange={() => clearError("login")}
          />
          <FormErrorMessage>{errors.login}</FormErrorMessage>
        </FormControl>

        <FormControl mb={2} isInvalid={!!errors.password}>
          <FormLabel color="text">Parol</FormLabel>
          <Input
            ref={passInput}
            type="password"
            placeholder="Parolni kiriting"
            onChange={() => clearError("password")}
          />
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          style={{ cursor: loading ? "progress" : "pointer" }}
          w="100%"
          isLoading={loading}
          _hover={{ bg: "secondary" }}
          loadingText="Loading..."
          variant="solidPrimary"
          mt={5}
        >
          Kirish
        </Button>
      </Box>
    </Flex>
  );
}