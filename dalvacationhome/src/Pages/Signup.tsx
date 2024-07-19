import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import poolData from "../utils/UserPoolInfo";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  ISignUpResult,
  ICognitoUserAttributeData,
} from "amazon-cognito-identity-js";

const Signup = () => {
  const [username, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [movie, setMovie] = useState<string>("");
  const [friend, setFriend] = useState<string>("");
  const [food, setFood] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [key, setKey] = useState<number>(0);

  const navigate = useNavigate();

  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [confirmPasswordError, setConfirmPasswordError] =
    useState<boolean>(false);
  const [keyError, setKeyError] = useState<boolean>(false);

  const signup = () => {
    const cognitoUserPool = new CognitoUserPool(poolData);

    const attributeList: CognitoUserAttribute[] = [];

    const attributes: ICognitoUserAttributeData[] = [
      { Name: "email", Value: email },
      { Name: "custom:Movie", Value: movie },
      { Name: "custom:Friend", Value: friend },
      { Name: "custom:Food", Value: food },
      { Name: "custom:Role", Value: role },
      { Name: "custom:Key", Value: key.toString() },
    ];

    attributes.forEach((attr) => {
      attributeList.push(new CognitoUserAttribute(attr));
    });

    cognitoUserPool.signUp(
      username,
      password,
      attributeList,
      [],
      (err: Error | undefined, data?: ISignUpResult) => {
        if (data) {
          console.log(data);

          navigate("/EmailVerification", {
            state: {
              username: username,
            },
          });
        }

        if (err) {
          console.log(err);
          toast.error("User with same email or username exist");
        }
      }
    );
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setUserName("");
    setEmail("");
    setMovie("");
    setFriend("");
    setFood("");
    setPassword("");
    setConfirmPassword("");
    setKey(0);
    setRole("");
    setPasswordError(false);
    setKeyError(false);
    setConfirmPasswordError(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setConfirmPasswordError(false);
    setPasswordError(false);
    setKeyError(false);

    event.preventDefault();

    const passwordRegex =
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (key <= 0 || key > 26) {
      setKeyError(true);
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(true);
    } else if (!passwordRegex.test(password)) {
      setPasswordError(true);
    } else {
      console.log(role);
      signup();
    }
  };

  return (
    <div className="bg-zinc-200 pt-10 min-h-screen flex justify-center items-center">
      <div className="max-w-md w-full p-5 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold mb-5 text-center">
          Register Yourself to Dal Vacation Home
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              name="userName"
              required
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="Email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>
                Select a role
              </option>
              <option value="property-agent">Property Agent</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className="text-sm sm:text-md text-justify mb-4 font-bold text-red-800">
            * Provide Answer to Security Questions. Remember this as this will
            be used when you are trying to log in to the Application.
          </div>

          <div>
            <label
              htmlFor="movie"
              className="block text-sm font-medium text-gray-700"
            >
              What is your Favourite Movie?
            </label>
            <input
              type="text"
              name="movie"
              required
              value={movie}
              onChange={(e) => setMovie(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="friend"
              className="block text-sm font-medium text-gray-700"
            >
              Who is your best Friend?
            </label>
            <input
              type="text"
              name="friend"
              required
              value={friend}
              onChange={(e) => setFriend(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label
              htmlFor="food"
              className="block text-sm font-medium text-gray-700"
            >
              What is your favourite food?
            </label>
            <input
              type="text"
              name="food"
              required
              value={food}
              onChange={(e) => setFood(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            {keyError && (
              <p className="text-red-600 mb-2">
                * Key should be greater than 0 and less than 26
              </p>
            )}
            <label htmlFor="key" className="block text-sm font-medium text-gray-700">
              Set a Key for a Security Caesar Cipher
            </label>
            <input
              type="number"
              name="key"
              required
              value={key}
              onChange={(e) => setKey(parseInt(e.target.value))}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            <div className="text-sm sm:text-md text-justify mb-4 font-bold text-red-800 mt-2">
              <p>
                For key = 2, abc + key = cde as a + 2 = c, b + 2 = d, c + 2 = e.
              </p>
              <p>So, for text = abc with key = 2, Ciphertext = cde</p>
            </div>
          </div>

          <div>
            <label
              htmlFor="Password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            {passwordError && (
              <p className="text-red-600 mt-2">
                * Password should contain alphabets with one capital letter,
                numbers, and special characters, and should be more than 8 characters long
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            {confirmPasswordError && (
              <p className="text-red-600 mt-2">
                * Password and Confirm Password should match
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm"
            >
              Register
            </button>
            <button
              type="reset"
              onClick={handleReset}
              className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
