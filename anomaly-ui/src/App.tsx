import React, { useState } from "react";
import PixelBlast from "./components/PixelBlast";
import axios from "axios";
import { Button, Select, createListCollection } from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi";

const App: React.FC = () => {
  const [files, setFile] = useState<FileList | null>(null);
  const [progress, setProgress] = useState({ started: false, pc: 0 });
  const [msg, setMsg] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedHeader, setSelectedHeader] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [chatQuestion, setChatQuestion] = useState<string>("");
  const [chatAnswer, setChatAnswer] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");

  function handleUpload() {
    if (!files) {
      setMsg("No file selected");
      return;
    }

    const fd = new FormData();
    for (let i = 0; i < files.length; i++) fd.append("file", files[i]);

    setMsg("Uploading...");
    setProgress((prev) => ({ ...prev, started: true }));

    axios
      .post("http://localhost:3001/upload", fd, {
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress({
            started: true,
            pc: Math.round((e.loaded / e.total) * 100),
          });
        },
      })
      .then((res) => {
        setMsg("Upload Successful");
        if (res.data.headers) setHeaders(res.data.headers);
      })
      .catch(() => setMsg("Upload Failed"));
  }

  const handleAnalyze = () => {
    if (!selectedHeader) {
      setMsg("Select a header first");
      return;
    }

    setMsg(`Analyzing column: ${selectedHeader}`);
    setIsAnalyzing(true);

    axios
      .post("http://localhost:3001/analyze", { column: selectedHeader })
      .then((res) => {
        setMsg("Analysis Complete");
        setSessionId(res.data.sessionId);
        setChatAnswer(
          `Analysis completed for "${selectedHeader}".\nAsk a question about the results.`
        );
      })
      .catch(() => {
        setMsg("Failed");
        setChatAnswer("Analysis failed. Try again.");
      });
  };

  const handleSendMessage = () => {
  const q = chatQuestion.trim();
  if (!q || chatLoading) return;

  setChatLoading(true);
  setChatAnswer("");

  axios
    .post("http://localhost:3001/chat", {
      sessionId: sessionId,
      userMessage: q
    })
    .then((res) => {
      setChatAnswer(res.data.chatbotReply);
      setChatLoading(false);
      setChatQuestion(""); 
    })
    .catch(() => {
      setChatAnswer("Error getting response. Try again.");
      setChatLoading(false);
      setChatQuestion(""); 
    });
};

  const fileName = files?.[0]?.name || "No file available";

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "black",
      }}
    >
      <PixelBlast
        variant="square"
        pixelSize={3}
        color="#8A2BE2"
        patternScale={2.5}
        patternDensity={1.2}
        enableRipples
        rippleIntensityScale={1.5}
        edgeFade={0.35}
        speed={0.6}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />

      {!isAnalyzing ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #3A0CA3, #7209B7)",
              borderRadius: 22,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              color: "black",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
              border: "2px solid #3A0CA3",
              width: "min(460px, 92vw)",
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files)}
              style={{ display: "none" }}
              id="file-upload"
            />

            <label htmlFor="file-upload">
              <Button bg="black" color="white" size="md" as="span">
                <HiUpload style={{ marginRight: 8 }} />
                Choose CSV File
              </Button>
            </label>

            {files && <span style={{ fontSize: 14 }}>{files[0].name}</span>}

            <Button
              onClick={handleUpload}
              bg="black"
              color="white"
              size="md"
              width={220}
            >
              Upload
            </Button>

            {headers.length > 0 && (
              <>
                <Select.Root
                  collection={createListCollection({
                    items: headers.map((h) => ({ label: h, value: h })),
                  })}
                  value={selectedHeader ? [selectedHeader] : []}
                  onValueChange={(d) => setSelectedHeader(d.value[0] || "")}
                  width="300px"
                >
                  <Select.Control>
                    <Select.Trigger bg="black" color="white">
                      <Select.ValueText placeholder="Select Column" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>

                  <Select.Positioner style={{ zIndex: 9999 }}>
                    <Select.Content bg="black" style={{ zIndex: 9999 }}>
                      {headers.map((h) => (
                        <Select.Item
                          item={{ label: h, value: h }}
                          key={h}
                          color="white"
                        >
                          {h}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>

                <Button
                  onClick={handleAnalyze}
                  bg="black"
                  color="white"
                  width={220}
                  disabled={!selectedHeader}
                >
                  Analyze
                </Button>
              </>
            )}

            {progress.started && (
              <progress
                max="100"
                value={progress.pc}
                style={{ width: "100%" }}
              />
            )}

            {msg && <span>{msg}</span>}
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: "min(980px, 96vw)",
              height: "min(720px, 92vh)",
              borderRadius: 18,
              overflow: "hidden",
              background: "rgba(10,10,11,0.78)",
              backdropFilter: "blur(14px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: 16,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                color: "white",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {fileName} — {selectedHeader}
            </div>

            <div style={{ flex: 1, padding: 18, overflowY: "auto" }}>
              <div
                style={{
                  borderRadius: 16,
                  padding: 16,
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Assistant</div>

                {chatLoading ? (
                  <div style={{ opacity: 0.7 }}>Thinking…</div>
                ) : (
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}>
                    {chatAnswer}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  borderRadius: 16,
                  padding: 10,
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <input
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Message"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: 14,
                  }}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!chatQuestion.trim() || chatLoading}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: "none",
                    background: "#3A0CA3",
                    color: "white",
                    cursor:
                      !chatQuestion.trim() || chatLoading
                        ? "not-allowed" : "pointer",
                    opacity:
                      !chatQuestion.trim() || chatLoading ? 0.5 : 1,
                  }}
                >
                  Send
                </button>
              </div>


            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;