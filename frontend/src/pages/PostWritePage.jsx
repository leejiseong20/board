import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import toast from "react-hot-toast";
import api from "../api/axios";
import { uploadImage } from "../api/upload";

function PostWritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const res = await uploadImage(file);
        const imageUrl = res.data.data; // "/api/upload/images/xxx.jpg" 상대경로 그대로 사용
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection(true);
        quill?.insertEmbed(range.index, "image", imageUrl);
        quill?.setSelection(range.index + 1);
      } catch (err) {
        toast.error("이미지 업로드에 실패했습니다.");
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
      ],
      handlers: { image: imageHandler },
    },
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("제목을 입력해주세요."); return; }
    if (!content || content === "<p><br></p>") { toast.error("내용을 입력해주세요."); return; }

    try {
      const res = await api.post("/api/posts", { title, content });
      toast.success("게시글이 등록되었습니다.");
      navigate(`/posts/${res.data.data}`);
    } catch (err) {
      console.error(err);
      toast.error("게시글 작성에 실패했습니다.");
    }
  };

  return (
    <div className="page-card">
      <h2 className="section-title">글쓰기</h2>

      <div className="form-group">
        <input
          className="input"
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <div className="char-count">{title.length} / 120</div>
      </div>

      <div className="editor-wrapper">
        {uploading && <div className="editor-uploading">이미지 업로드 중...</div>}
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          placeholder="내용을 입력하세요"
        />
      </div>

      <div className="button-row" style={{ marginTop: "16px" }}>
        <button className="btn" onClick={() => navigate(-1)}>취소</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={uploading}>등록</button>
      </div>
    </div>
  );
}

export default PostWritePage;
