import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import poolData from "../utils/UserPoolInfo";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  ISignUpResult,
  ICognitoUserAttributeData
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
  const [confirmPasswordError, setConfirmPasswordError] = useState<boolean>(false);
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
      { Name: "custom:Key", Value: key.toString() }
    ];

    attributes.forEach(attr => {
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
              username: username
            }
          });
        }
      
        if (err) {
          console.log(err)
          toast.error("User with same email or username exist");
        }
      })   
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

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (key <= 0 || key>26) {
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
    <div className="bg-slate-800 py-8 px-8 min-h-screen shadow-md shadow-slate-400 flex justify-center">
      <div className="h-[50%] w-[50%] border-1-black border pt-2 border-black rounded-md bg-white">
        <h1 className="text-md sm:text-xl text-xl font-bold font-mono text-black text-center">
          Register Yourself to Dal Vacation Home
        </h1>
        <div className="flex justify-center">
          <form onSubmit={handleSubmit} className="text-md py-4 px-3 mb-4">
            <div className="mb-4 px-3">
              <label
                htmlFor="userName"
                className="block text-gray-900 text-sm mb-2"
              >
                Name
              </label>
              <input
                type="text"
                name="userName"
                required
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="Email"
                className="block text-gray-900 text-sm mb-2"
              >
                Email
              </label>
              <input
                type="email"
                name="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="role"
                className="block text-gray-900 text-sm mb-2"
              >
                Role :
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="property-agent">Property Agent</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div className="text-sm sm:text-md text-justify w-[80%] mb-4 px-3 font-bold font-mono text-red-800">
              * Provide Answer to Security Questions. Remember this as this will
              be used when you are trying to log in to the Application.
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="movie"
                className="block text-gray-900 text-sm mb-2"
              >
                What is your Favourite Movie ?
              </label>
              <input
                type="text"
                name="movie"
                required
                value={movie}
                onChange={(e) => setMovie(e.target.value)}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="friend"
                className="block text-gray-900 text-sm mb-2"
              >
                Who is your best Friend ?
              </label>
              <input
                type="text"
                name="friend"
                required
                value={friend}
                onChange={(e) => setFriend(e.target.value)}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="food"
                className="block text-gray-900 text-sm mb-2"
              >
                What is your favourite food ?
              </label>
              <input
                type="text"
                name="food"
                required
                value={food}
                onChange={(e) => setFood(e.target.value)}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4 px-3">
              {keyError && (
                <p className="text-red-600">
                  * Key should be greater than 0 and less than 26
                </p>
              )}
              <label htmlFor="key" className="block text-gray-900 text-sm mb-2">
                Set a Key for a Security Ceaser Cipher
              </label>
              <input
                type="number"
                name="key"
                required
                value={key}
                onChange={(e) => setKey(parseInt(e.target.value))}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
              <div className="text-sm sm:text-md text-justify mb-4 px-3 font-bold text-red-800 mt-2">
                <p>
                  For key = 2, abc + key = cde as a + 2 = c, b + 2 = d, c + 2 =
                  e.{" "}
                </p>
                <p>So, for text = abc with key = 2 . Ciphertext = cde</p>
              </div>
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="Password"
                className="block text-gray-900 text-sm mb-2"
              >
                Password
              </label>
              <input
                type="password"
                name="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
              {passwordError && (
                <p className="text-red-600">
                  * Password should contain Alphabets with one Capital letter,
                  Numbers and Special Characters and should have more than 8
                  length
                </p>
              )}
            </div>

            <div className="mb-4 px-3">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-900 text-sm mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
              {confirmPasswordError && (
                <p className="text-red-600">
                  * Password and Confirm Password should match
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn bg-green-600 hover:bg-green-800 text-white text-sm font-bold py-2 px-4 mx-4 rounded "
            >
              Register
            </button>
            <button
              type="reset"
              onClick={handleReset}
              className="btn bg-gray-600 hover:bg-gray-800 text-white text-sm font-bold py-2 px-4 mx-4 rounded "
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
