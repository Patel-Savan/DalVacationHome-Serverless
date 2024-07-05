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
    <div className="bg-slate-800 py-8 px-8 min-h-screen shadow-md shadow-slate-400 flex justify-center">
      <div className="h-[50%] w-[50%] border-1-black border pt-2 border-black rounded-md bg-white">
        <h1 className="text-md sm:text-xl text-xl font-bold font-mono text-black text-center">
          Submit Code received in your mail
        </h1>
        <div className="flex justify-center">
          <form
            onSubmit={handleVerification}
            className="text-md py-4 px-3 mb-4"
          >
            <div className="mb-4 px-3">
              <label
                htmlFor="verificationCode"
                className="block text-gray-900 text-sm mb-2"
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
                className="shadow-xl border border-gray-600 appearance-none rounded-md w-[80%] text-sm px-3 py-1 mx-1 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
              {codeError && (
                <p className="text-red-600">
                  * Verification Code length must be 6
                </p>
              )}
            </div>
            <button
              type="submit"
              className="btn bg-green-600 hover:bg-green-800 text-white text-sm font-bold py-2 px-4 mx-4 rounded"
            >
              Verify Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
