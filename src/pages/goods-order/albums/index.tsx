import FileUploader from "@/components/FileUploader";

const index = () => {
  return (
    <div>
      <FileUploader
        accept=".png,.jpg,.jpeg,.gif,.exe,.rar"
        allowedTypes={[
          "image/png",
          "image/jpeg",
          "image/gif",
          "application/x-rar-compressed",
          "application/x-msdownload",
        ]}
        maxSizeMB={300}
        multiple={true}
        apiUrl="/api/file"
        keepAfterUpload={false}
        removeDelayMs={1000}
        onRemoveAfterUpload={(file, reason) => {
          console.log(file, reason);
          return true;
        }}
      />
    </div>
  );
};
export default index;
