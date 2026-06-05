import Class from "../models/Class.model.js";
import Attendance from "../models/Attendance.model.js";
import activeSession from "./session.js";

const OPEN = 1;

const sendJson = (client, payload) => {
  if (client.readyState === OPEN) {
    client.send(JSON.stringify(payload));
  }
};

const sendError = (ws, msg) => {
  sendJson(ws, {
    event: "ERROR",
    data: { message: msg },
  });
};

const broadcast = (wss, payload) => {
  wss.clients.forEach((client) => {
    sendJson(client, payload);
  });
};

export const handleMessage = async (ws, wss, message) => {
  const { event, data } = message;

  if (event === "ATTENDANCE_MARKED") {
    if (ws.user.role !== "teacher") {
      sendError(ws, "Forbidden, teacher event only");
      return;
    }
    if (!activeSession.classId) {
      sendError(ws, "No active attendance session");
      return;
    }

    activeSession.attendance[data.studentId] = data.status;

    broadcast(wss, {
      event: "ATTENDANCE_MARKED",
      data: { studentId: data.studentId, status: data.status },
    });
  } else if (event === "TODAY_SUMMARY") {
    if (ws.user.role !== "teacher") {
      sendError(ws, "Forbidden, teacher event only");
      return;
    }

    if (!activeSession.classId) {
      sendError(ws, "No active attendance session");
      return;
    }

    const attendanceValues = Object.values(activeSession.attendance);
    const present = attendanceValues.filter((s) => s === "present").length;
    const absent = attendanceValues.filter((s) => s === "absent").length;
    const total = attendanceValues.length;

    broadcast(wss, {
      event: "TODAY_SUMMARY",
      data: { present, absent, total },
    });
  } else if (event === "MY_ATTENDANCE") {
    if (ws.user.role !== "student")
      return sendError(ws, "Forbidden, student event only");
    if (!activeSession.classId)
      return sendError(ws, "No active attendance session");

    const status =
      activeSession.attendance[ws.user.userId] || "not yet updated";

    // unicast - only send to this student
    sendJson(ws, {
      event: "MY_ATTENDANCE",
      data: { status },
    });
  } else if (event === "DONE") {
    if (ws.user.role !== "teacher") {
      return sendError(ws, "Forbidden, teacher event only");
    }
    if (!activeSession.classId) {
      return sendError(ws, "No active attendance session");
    }

    // async because we need to talk to MongoDB
    (async () => {
      try {
        // get all students in this class
        const classDoc = await Class.findById(activeSession.classId);
        if (!classDoc) {
          sendError(ws, "Class not found");
          return;
        }

        const allStudentIds = classDoc.studentIds.map((id) => id.toString());

        // mark absent anyone not already in attendance
        allStudentIds.forEach((studentId) => {
          if (!activeSession.attendance[studentId]) {
            activeSession.attendance[studentId] = "absent";
          }
        });
        
        // persist every student's attendance to MongoDB
        const records = allStudentIds.map((studentId) => ({
          classId: activeSession.classId,
          studentId,
          status: activeSession.attendance[studentId],
        }));

        await Attendance.insertMany(records);

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
        broadcast(wss, {
          event: "DONE",
          data: { message: "Attendance persisted", present, absent, total },
        });
      } catch (err) {
        sendError(ws, "Something went wrong while persisting attendance");
      }
    })();
  } else {
    sendError(ws, "Unknown event");
  }
};
