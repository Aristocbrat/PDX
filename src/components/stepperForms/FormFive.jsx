import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import useUploadSignature from "../../features/contracts/useUploadSignature";
import Button from "../Button";
import CustomForm from "../../ui/CustomForm";

const FormFive = ({ nextStep, username }) => {
  const { uploadSignature, sendingForm } = useUploadSignature();
  const sigCanvas = useRef(null);

  const validationSchema = Yup.object({
    signature: Yup.mixed().required("Signature is required"),
  });

  const formik = useFormik({
    validationSchema,
    initialValues: {
      signature: null,
    },
    onSubmit: (values, { setSubmitting }) => {
      const formData = new FormData();
      formData.append("signature", values.signature);

      uploadSignature(formData, {
        onSuccess: () => {
          //  Save signature URL or flag for this user
          localStorage.setItem(`${username}_signatureSaved`, "true");
          nextStep();
        },
        onSettled: () => {
          setSubmitting(false);
        },
      });
    },
  });

  const saveSignature = () => {
    const canvas = sigCanvas.current.getCanvas();
    canvas.toBlob((blob) => {
      const signatureFile = new File([blob], "signature.png", { type: "image/png" });
      formik.setFieldValue("signature", signatureFile);

      //  Optionally store a preview or flag
      localStorage.setItem(`${username}_signaturePreview`, canvas.toDataURL());
    }, "image/png");
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
    formik.setFieldValue("signature", null);
    localStorage.removeItem(`${username}_signaturePreview`);
  };

  return (
    <div className="overflow-hidden">
      <div className="text-lg font-semibold leading-normal mb-6 xl:text-2xl xl:mb-[32px]">
        Sign Signature
      </div>

      <div className="bg-gray-50 h-[202px]">
        <SignatureCanvas
          ref={sigCanvas}
          onBegin={() => console.log("started")}
          onEnd={() => {
            saveSignature();
            console.log("ended");
          }}
          canvasProps={{
            color: "white",
            className: "mx-auto",
            width: 400,
            height: 202,
          }}
        />

        <div className="flex justify-end my-4">
          <button onClick={clearSignature}>Clear</button>
        </div>
      </div>

      <CustomForm onSubmit={formik.handleSubmit}>
        <div className="mt-[50px] xl:mb-[66px] lg:flex lg:justify-center">
          <div>
            <Button
              buttonType="submit"
              disabled={formik.isSubmitting || sendingForm || !formik.isValid || !formik.dirty}
              isLoading={sendingForm}
              type="primary"
            >
              Use Signature
            </Button>
          </div>
        </div>
      </CustomForm>
    </div>
  );
};

export default FormFive;