import sign from "../../assets/svg/sign.svg";
import sendContract from "../../assets/svg/sendcontract.svg";

import { useSearchParams, useNavigate } from "react-router-dom";
import { formatCurrency, formatDate } from "../../utlity/helper";
import useFinalizeContract from "../../features/contracts/useFinalizeContract";
import Button from "../Button";
import { useState, useEffect } from "react";

const FormFour = ({
  savedState,
  heading,
  nextStep,
  setCurrentStep,
  signature,
  hasSignature,
  username, //  Accept username as prop
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contractType = searchParams.get("contractType") ?? "";
  const { finalize, sendingForm } = useFinalizeContract();
  const [completionCount, setCompletionCount] = useState(0);

  //  Currency from user-specific localStorage
  const currencyCode = localStorage.getItem(`${username}_userCurrencyCode`) || "USD";
  const locale = currencyCode === "NGN" ? "en-NG" : "en-US";

  useEffect(() => {
    const count = sessionStorage.getItem(`${username}_contractCompletionCount`);
    setCompletionCount(count ? parseInt(count) : 0);
  }, [username]);

  const userInfo = [
    {
      title: "Contract Type",
      data: contractType.split("-").join(" "),
    },
    {
      title: "Start Date",
      data: savedState?.startDate ? formatDate(savedState.startDate) : "-",
    },
    {
      title: "End Date",
      data: savedState?.endDate ? formatDate(savedState.endDate) : "-",
    },
    {
      title: "Job Title",
      data: savedState?.roleTitle ?? "-",
    },
    {
      title: "Seniority Level",
      data: savedState?.seniorityLevel ?? "-",
    },
    {
      title: "Scope of Work",
      data: savedState?.scopeOfWork ?? "-",
    },
    {
      title: "Payment Rate",
      data: formatCurrency(savedState?.paymentRate || 0, currencyCode, locale) ?? "-",
    },
    {
      title: "Payment Frequency",
      data: savedState?.paymentFrequency ?? "-",
    },
  ];

  const sendFinalForm = () => {
    finalize(savedState, {
      onSuccess: () => {
        // nextStep(); // Uncomment if you want to auto-advance
      },
    });

    //  Clear user-specific step and update completion count
    sessionStorage.removeItem(`${username}_currentStep`);
    const newCount = completionCount + 1;
    setCompletionCount(newCount);
    sessionStorage.setItem(`${username}_contractCompletionCount`, newCount.toString());
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="text-lg font-semibold leading-normal xl:text-2xl xl:mb-[18px]">
        {heading}
      </div>

      <div className="bg-white rounded-lg border border-solid border-[#00000033] px-10 pt-[53px] text-[0.625rem] xl:text-[1.125rem]">
        {userInfo.map((item, index) => (
          <div className="flex justify-between mb-[45px]" key={index}>
            <p className="text-[#00000080]">{item.title}</p>
            <p className="text-right capitalize">{item.data}</p>
          </div>
        ))}

        {signature && (
          <div className="mb-[39px]">
            <div className="w-full h-[0.5px] bg-[#0000004d]"></div>
            <div className="mt-[39px] max-w-[100px] mx-auto">
              <img src={signature} alt="user signature" />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (hasSignature) {
            setCurrentStep(5);
          } else {
            nextStep();
          }
        }}
        className="flex items-center justify-between border border-solid border-[#00000033] px-[15px] py-[10px] bg-[#d9d9d980] rounded-lg xl:px-[30px] xl:py-[19px] cursor-pointer"
      >
        <div className="font-medium text-[0.6875rem] text-[#00000099] xl:text-[1.125rem]">
          {hasSignature ? "Re-Sign Contract" : "Sign Contract"}
        </div>
        <img src={sign} alt="sign icon" />
      </button>

      {hasSignature && (
        <div className="w-full flex items-center justify-center">
          <Button
            type="primary"
            onClick={sendFinalForm}
            isLoading={sendingForm}
            disabled={sendingForm}
            size="full"
            iconRight={<img src={sendContract} alt="send icon" />}
          >
            Send Contract
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormFour;