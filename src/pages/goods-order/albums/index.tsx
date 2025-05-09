import FileUploader from "@/components/FileUploader";

const index = () => {
  return (
    <div>
      <FileUploader
        accept=".png,.jpg,.jpeg,.gif"
        maxSizeMB={10}
        multiple={true}
      />
    </div>
  );
};
export default index;
