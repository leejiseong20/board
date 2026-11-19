import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import toast from "react-hot-toast";
import api from "../api/axios";
import { uploadImage } from "../api/upload";

function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadPost = async () => {
      try {
        const res = await api.get(`/api/posts/${id}`);
        if (!cancelled) {
          setTitle(res.data.data.title);
          setContent(res.data.data.content || "");
        }
      } catch (err) {
        console.error(err);
        toast.error("게시글을 불러오지 못했습니다.");
      }
    };
    loadPost();
    return () => { cancelled = true; };
  }, [id]);

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
        const imageUrl = res.data.data; // 상대경로 그대로 사용
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

  const handleUpdate = async () => {
    if (!title.trim()) { toast.error("제목을 입력해주세요."); return; }
    if (!content || content === "<p><br></p>") { toast.error("내용을 입력해주세요."); return; }
    try {
      await api.put(`/api/posts/${id}`, { title, content });
      toast.success("게시글이 수정되었습니다.");
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("게시글 수정에 실패했습니다.");
    }
  };

  if (content === null) return <div className="loading-text">불러오는 중...</div>;

  return (
    <div className="page-card">
      <h2 className="section-title">게시글 수정</h2>

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
        />
      </div>

      <div className="button-row" style={{ marginTop: "16px" }}>
        <button className="btn" onClick={() => navigate(-1)}>취소</button>
        <button className="btn btn-primary" onClick={handleUpdate} disabled={uploading}>수정 완료</button>
      </div>
    </div>
  );
}

export default PostEditPage;
