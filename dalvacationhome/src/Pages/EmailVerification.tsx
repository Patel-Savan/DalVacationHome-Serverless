import React, { useState, useEffect, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";
import { toast } from "react-toastify";
import poolData from "../utils/UserPoolInfo";

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [codeError, setCodeError] = useState<boolean>(false);
  const navigate = useNavigate();

  const location = useLocation();
  const username: string = location.state?.username || "";

  useEffect(() => {
    if (!username) {
      toast.error("Register First");
      navigate("/Signup");
    }
  }, [username, navigate]);

  const Verify = () => {
    const userData = {
      Username: username,
      Pool: new CognitoUserPool(poolData)
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
      if (err) {
        console.error(err.message);
        toast.error("Failed to verify code. Please try again.");
        return;
      }
      console.log("Verification successful:", result);
      toast.success("Verification successful!");
      navigate("/Login", {
        state: {
          username: username
        }
      }); // Redirect to login page or any other page upon successful verification
    });
  };

  const handleVerification = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (verificationCode.length !== 6) {
      setCodeError(true);
    } else {
      Verify();
    }
  };

  return (
    <div className="bg-zinc-200 pt-10 min-h-screen flex justify-center items-center">
      <div className="max-w-md w-full p-5 border rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-semibold mb-5 text-center">
          Submit Code Received in Your Mail
        </h2>
        <form onSubmit={handleVerification} className="space-y-4">
          <div>
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              required
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
            {codeError && (
              <p className="text-red-600 mt-2">
                * Verification Code length must be 6
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-sm"
          >
            Verify Code
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerification;
