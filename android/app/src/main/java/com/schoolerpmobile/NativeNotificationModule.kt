package com.schoolerpmobile

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.atomic.AtomicInteger

class NativeNotificationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val TAG = "NativeNotification"
        const val MODULE_NAME = "NativeNotification"
        const val CHANNEL_ID = "volpehub_default_channel"
        private val notificationIdCounter = AtomicInteger(1000)
        var instance: NativeNotificationModule? = null

        fun handleIntent(intent: Intent?) {
            if (intent == null) return
            val extras = intent.extras ?: return
            if (extras.containsKey("conversationId") || extras.containsKey("type") || extras.containsKey("notificationId")) {
                val map = Arguments.createMap()
                for (key in extras.keySet()) {
                    val value = extras.get(key)
                    if (value != null) {
                        map.putString(key, value.toString())
                    }
                }
                instance?.sendTapEvent(map)
            }
        }
    }

    init {
        instance = this
    }

    override fun getName(): String = MODULE_NAME

    fun sendTapEvent(params: ReadableMap) {
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onNativeNotificationTapped", params)
        } catch (e: Exception) {
            Log.w(TAG, "sendTapEvent error: ${e.message}")
        }
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Required for React Native event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for React Native event emitter
    }

    @ReactMethod
    fun displayNotification(title: String, body: String, data: ReadableMap?) {
        Log.i(TAG, "displayNotification called: title=$title, body=$body")
        try {
            val context: Context = reactContext.applicationContext

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val granted = ContextCompat.checkSelfPermission(
                    context,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
                if (!granted) {
                    Log.w(TAG, "POST_NOTIFICATIONS permission NOT granted")
                    return
                }
            }

            val notificationId = notificationIdCounter.incrementAndGet()
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                if (data != null) {
                    val iterator = data.keySetIterator()
                    while (iterator.hasNextKey()) {
                        val key = iterator.nextKey()
                        val valueStr = when (data.getType(key)) {
                            ReadableType.String -> data.getString(key)
                            ReadableType.Number -> data.getDouble(key).toString()
                            ReadableType.Boolean -> data.getBoolean(key).toString()
                            else -> data.getString(key)
                        }
                        putExtra(key, valueStr)
                    }
                }
            }

            val pendingIntent = PendingIntent.getActivity(
                context,
                notificationId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val smallIconResId = context.resources.getIdentifier("ic_notification", "drawable", context.packageName)
            val fallbackIconResId = context.resources.getIdentifier("ic_launcher", "mipmap", context.packageName)
            val finalSmallIcon = if (smallIconResId != 0) smallIconResId else (if (fallbackIconResId != 0) fallbackIconResId else android.R.drawable.ic_dialog_info)

            val largeIconBitmap = try {
                val largeResId = context.resources.getIdentifier("ic_notification_large", "drawable", context.packageName)
                if (largeResId != 0) {
                    android.graphics.BitmapFactory.decodeResource(context.resources, largeResId)
                } else {
                    val roundResId = context.resources.getIdentifier("ic_launcher_round", "mipmap", context.packageName)
                    val targetResId = if (roundResId != 0) roundResId else fallbackIconResId
                    if (targetResId != 0) {
                        val drawable = ContextCompat.getDrawable(context, targetResId)
                        if (drawable != null) {
                            val w = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 192
                            val h = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 192
                            val bmp = android.graphics.Bitmap.createBitmap(w, h, android.graphics.Bitmap.Config.ARGB_8888)
                            val canvas = android.graphics.Canvas(bmp)
                            drawable.setBounds(0, 0, w, h)
                            drawable.draw(canvas)
                            bmp
                        } else null
                    } else null
                }
            } catch (e: Exception) {
                Log.w(TAG, "Failed to decode large icon: ${e.message}")
                null
            }
            Log.i(TAG, "Notification icons: smallIcon=$finalSmallIcon, hasLargeBitmap=${largeIconBitmap != null}")

            val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

            val builder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(finalSmallIcon)
                .setColor(0xFF2563EB.toInt())
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setSound(defaultSoundUri)
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)

            if (largeIconBitmap != null) {
                builder.setLargeIcon(largeIconBitmap)
            }

            val notificationManager = NotificationManagerCompat.from(context)
            notificationManager.notify(notificationId, builder.build())
            Log.i(TAG, "Notification posted successfully with ID: $notificationId")
        } catch (e: Exception) {
            Log.e(TAG, "Error posting notification: ${e.message}", e)
        }
    }
}
