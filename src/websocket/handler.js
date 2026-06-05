import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";
import activeSession from "./session.js";

export const handleMessage = async (ws, wss, message) => {
  const { event, data } = message;

  function sendError(msg) {
    ws.send(
      JSON.stringify({
        event: "ERROR",
        data: { message: msg },
      }),
    );
  }

  function broadcast(payload) {
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(payload));
    });
  }

  if (event === "ATTENDANCE_MARKED") {
    console.log(ws.user);
    if (ws.user.role !== "teacher") {
      ws.send(
        JSON.stringify({
          event: "ERROR",
          data: { message: "Forbidden ,Teacher event only" },
        }),
      );
      return;
    }
    if (!activeSession.classId) {
      ws.send(
        JSON.stringify({
          event: "ERROR",
          data: { message: "No active attendance session" },
        }),
      );
      return;
    }
    activeSession.attendance[data.studentId] = data.status;

    wss.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          event: "ATTENDANCE_MARKED",
          data: { studentId: data.studentId, status: data.status },
        }),
      );
    });
  } else if (event === "TODAY_SUMMARY") {
    if (ws.user.role !== "teacher")
      return sendError("Forbidden, teacher event only");
    if (!activeSession.classId)
      return sendError("No active attendance session");

    const attendanceValues = Object.values(activeSession.attendance);
    const present = attendanceValues.filter((s) => s === "present").length;
    const absent = attendanceValues.filter((s) => s === "absent").length;
    const total = attendanceValues.length;

    broadcast({
      event: "TODAY_SUMMARY",
      data: { present, absent, total },
    });
  } else if (event === "MY_ATTENDANCE") {
    if (ws.user.role !== "student")
      return sendError("Forbidden, student event only");
    if (!activeSession.classId)
      return sendError("No active attendance session");

    const status =
      activeSession.attendance[ws.user.userId] || "not yet updated";

    // unicast - only send to this student
    ws.send(
      JSON.stringify({
        event: "MY_ATTENDANCE",
        data: { status },
      }),
    );
  } else if (event === "DONE") {
    if (ws.user.role !== "teacher")
      return sendError("Forbidden, teacher event only");
    if (!activeSession.classId)
      return sendError("No active attendance session");

    // async because we need to talk to MongoDB
    (async () => {
      try {
        // get all students in this class
        const classDoc = await Class.findById(activeSession.classId);
        console.log(classDoc)
        const allStudentIds = classDoc.studentIds.map((id) => id.toString());
        console.log(allStudentIds)

        // mark absent anyone not already in attendance
        allStudentIds.forEach((studentId) => {
          if (!activeSession.attendance[studentId]) {
            activeSession.attendance[studentId] = "absent";
          }
        });
        console.log("code reach here 1")
        
        // persist every student's attendance to MongoDB
        const records = allStudentIds.map((studentId) => ({
          classId: activeSession.classId,
          studentId,
          status: activeSession.attendance[studentId],
        }));
        
        console.log("code reach here 2")
        console.log(records)
        await Attendance.insertMany(records);
        
        console.log("code reach here 3")
        // calculate final summary
        const attendanceValues = Object.values(activeSession.attendance);
        const present = attendanceValues.filter((s) => s === "present").length;
        const absent = attendanceValues.filter((s) => s === "absent").length;
        const total = attendanceValues.length;

        // clear memory
        activeSession.classId = null;
        activeSession.startedAt = null;
        activeSession.attendance = {};

        // broadcast
        broadcast({
          event: "DONE",
          data: { message: "Attendance persisted", present, absent, total },
        });
      } catch (err) {
        sendError("Something went wrong while persisting attendance");
      }
    })();
  }
};
