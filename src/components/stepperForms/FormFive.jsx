import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import useUploadSignature from "../../features/contracts/useUploadSignature";
import Button from "../Button";
import CustomForm from "../../ui/CustomForm";
import toast from "react-hot-toast";

const FormFive = ({ nextStep, setSignatureFile }) => {
  const { uploadSignature, sendingForm } = useUploadSignature();
  const sigCanvas = useRef(null);

  const validationSchema = Yup.object({
    signature: Yup.mixed().required("Signature is required"),
  });

  const formik = useFormik({
    validationSchema,
    initialValues: { signature: null },
    onSubmit: (values, { setSubmitting }) => {
      const formData = new FormData();
      formData.append("signature", values.signature);

      uploadSignature(formData, {
        onSuccess: () => {
          setSignatureFile(values.signature);
          toast.success("Signature uploaded successfully!");
          nextStep();
        },
        onError: () => {
          toast.error(" Failed to upload signature.");
        },
        onSettled: () => {
          setSubmitting(false);
        },
      });
    },
  });

  const saveSignature = () => {
    const canvas = sigCanvas.current?.getCanvas();
    if (!canvas || sigCanvas.current.isEmpty()) {
      formik.setFieldError("signature", "Please provide a signature.");
      return;
    }

    canvas.toBlob((blob) => {
      const signatureFile = new File([blob], "signature.png", {
        type: "image/png",
      });
      formik.setFieldValue("signature", signatureFile);
      formik.handleSubmit();
    }, "image/png");
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    formik.setFieldValue("signature", null);
  };

  return (
    <div className="overflow-hidden">
      <div className="text-lg font-semibold leading-normal mb-6 xl:text-2xl xl:mb-[32px]">
        Sign Signature
      </div>

      <div className="bg-gray-50 h-[202px]">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "mx-auto",
            width: 400,
            height: 202,
          }}
        />
        <div className="flex justify-end my-4">
          <button onClick={clearSignature}>Clear</button>
        </div>
      </div>

      <CustomForm onSubmit={(e) => e.preventDefault()}>
        <div className="mt-[50px] xl:mb-[66px] lg:flex lg:justify-center">
          <Button
            buttonType="button"
            disabled={formik.isSubmitting || sendingForm}
            isLoading={sendingForm}
            type="primary"
            onClick={saveSignature}
          >
            Use Signature
          </Button>
        </div>
      </CustomForm>
    </div>
  );
};

export default FormFive;