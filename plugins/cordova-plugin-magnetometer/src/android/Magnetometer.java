/**
*   Magnetometer.java
*
*   A Java Class for the Cordova Magnetometer Plugin
*
*   @by Steven de Salas (desalasworks.com | github/sdesalas)
*   @licence MIT
*
*   @see https://github.com/sdesalas/cordova-plugin-magnetometer
*   @see https://github.com/apache/cordova-plugin-device-orientation
*   @see http://www.techrepublic.com/article/pro-tip-create-your-own-magnetic-compass-using-androids-internal-sensors/
*   
*/

package org.apache.cordova.magnetometer;

import java.util.List;
import java.util.ArrayList;
import java.lang.Math;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.content.Context;

import android.os.Handler;
import android.os.Looper;


public class Magnetometer extends CordovaPlugin implements SensorEventListener  {

    public static int STOPPED = 0;
    public static int STARTING = 1;
    public static int RUNNING = 2;
    public static int ERROR_FAILED_TO_START = 3;

    public long TIMEOUT = 30000;        // Timeout in msec to shut off listener

    int status;                         // status of listener
    float ax;
    float ay;
    float az;

    float mx;                            // magnetometer x value
    float my;                            // magnetometer y value
    float mz;                            // magnetometer z value

    float gx;                            // gyroscope x value
    float gy;                            // gyroscope  y value
    float gz;                            // gyroscope  z value

    float magnitude;                    // magnetometer calculated magnitude
    long timeStamp;                     // time of most recent value
    long lastAccessTime;                // time the value was last retrieved

      public float swRoll;
      public float swPitch;
      public float swAzimuth;

      public SensorManager mSensorManager;
      public Sensor accelerometer;
      public Sensor magnetometer;
      public Sensor gyroscope;

      public float[] mAccelerometer = null;
      public float[] mGeomagnetic = null;
      public float[] mGyroscope = null;

    private SensorManager sensorManager;// Sensor manager
    Sensor mSensor;                     // Magnetic sensor returned by sensor manager

    private CallbackContext callbackContext;
    List<CallbackContext> watchContexts;

    public Magnetometer() {
        this.ax = 0;
        this.ay = 0;
        this.az = 0;

        this.gx = 0;
        this.gy = 0;
        this.gz = 0;

        this.mx = 0;
        this.my = 0;
        this.mz = 0;

        this.timeStamp = 0;
        this.watchContexts = new ArrayList<CallbackContext>();
        this.setStatus(Magnetometer.STOPPED);
    }

    public void onDestroy() {
        this.stop();
    }

    public void onReset() {
        this.stop();
    }

    //--------------------------------------------------------------------------
    // Cordova Plugin Methods
    //--------------------------------------------------------------------------

    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        this.sensorManager = (SensorManager) cordova.getActivity().getSystemService(Context.SENSOR_SERVICE);
    }

    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("start")) {
            this.start();
        }
        else if (action.equals("stop")) {
            this.stop();
        }
        else if (action.equals("getStatus")) {
            int i = this.getStatus();
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, i));
        }
        else if (action.equals("getReading")) {
            // If not running, then this is an async call, so don't worry about waiting
            if (this.status != Magnetometer.RUNNING) {
                int r = this.start();
                if (r == Magnetometer.ERROR_FAILED_TO_START) {
                    callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.IO_EXCEPTION, Magnetometer.ERROR_FAILED_TO_START));
                    return false;
                }
                // Set a timeout callback on the main thread.
                Handler handler = new Handler(Looper.getMainLooper());
                handler.postDelayed(new Runnable() {
                    public void run() {
                        Magnetometer.this.timeout();
                    }
                }, 2000);
            }
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, getReading()));
        } else {
            // Unsupported action
            return false;
        }
        return true;
    }

    //--------------------------------------------------------------------------
    // Local Methods
    //--------------------------------------------------------------------------

    /**
     * Start listening for compass sensor.
     *
     * @return          status of listener
     */
    public int start() {

        // If already starting or running, then just return
        if ((this.status == Magnetometer.RUNNING) || (this.status == Magnetometer.STARTING)) {
            return this.status;
        }

        // Get magnetic field sensor from sensor manager
        @SuppressWarnings("deprecation")
        List<Sensor> list = this.sensorManager.getSensorList(Sensor.TYPE_MAGNETIC_FIELD);
        List<Sensor> accelerometerList = this.sensorManager.getSensorList(Sensor.TYPE_ACCELEROMETER);
        List<Sensor> gyroList = this.sensorManager.getSensorList(Sensor.TYPE_GYROSCOPE);

        // If found, then register as listener
        if (list != null && list.size() > 0) {
            swRoll = 0;
            swPitch = 0;
            swAzimuth = 0;

            this.magnetometer = list.get(0);
            this.accelerometer = accelerometerList.get(0);
            this.gyroscope = gyroList.get(0);

            this.sensorManager.registerListener(this, this.magnetometer, SensorManager.SENSOR_DELAY_FASTEST);
            this.sensorManager.registerListener(this, this.accelerometer, SensorManager.SENSOR_DELAY_FASTEST);
            this.sensorManager.registerListener(this, this.gyroscope, SensorManager.SENSOR_DELAY_FASTEST);

            this.lastAccessTime = System.currentTimeMillis();
            this.setStatus(Magnetometer.STARTING);
        }

        // If error, then set status to error
        else {
            this.setStatus(Magnetometer.ERROR_FAILED_TO_START);
        }

        return this.status;
    }

    /**
     * Stop listening to compass sensor.
     */
    public void stop() {
        if (this.status != Magnetometer.STOPPED) {
            this.sensorManager.unregisterListener(this);
        }
        this.setStatus(Magnetometer.STOPPED);
    }

    /**
     * Called after a delay to time out if the listener has not attached fast enough.
     */
    private void timeout() {
        if (this.status == Magnetometer.STARTING) {
            this.setStatus(Magnetometer.ERROR_FAILED_TO_START);
            if (this.callbackContext != null) {
                this.callbackContext.error("Magnetometer listener failed to start.");
            }
        }
    }

    public void Clear() {
            this.sensorManager.unregisterListener(this, accelerometer);
            this.sensorManager.unregisterListener(this, magnetometer);
      }
    //--------------------------------------------------------------------------
    // SensorEventListener Interface
    //--------------------------------------------------------------------------

    /**
     * Sensor listener event.
     *
     * @param event
     */
    public void onSensorChanged(SensorEvent event) {

        // onSensorChanged gets called for each sensor so we have to remember the values
                 if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
                     mAccelerometer = event.values;
                     this.ax = mAccelerometer[0];
                     this.ay = mAccelerometer[1];
                     this.az = mAccelerometer[2];
                 }
                 if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
                     mGeomagnetic = event.values;

                     this.mx = mGeomagnetic[0];
                     this.my = mGeomagnetic[1];
                     this.mz = mGeomagnetic[2];
                 }
                 if (event.sensor.getType() == Sensor.TYPE_GYROSCOPE) {
                      mGyroscope = event.values;

                      this.gx = mGyroscope[0];
                      this.gy = mGyroscope[1];
                      this.gz = mGyroscope[2];
                  }
    }

    /**
     * Required by SensorEventListener
     * @param sensor
     * @param accuracy
     */
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // DO NOTHING
    }

    // ------------------------------------------------
    // JavaScript Interaction
    // ------------------------------------------------

    /**
     * Get status of magnetic sensor.
     *
     * @return          status
     */
    public int getStatus() {
        return this.status;
    }

    /**
     * Set the status and send it to JavaScript.
     * @param status
     */
    private void setStatus(int status) {
        this.status = status;
    }

    /**
     * Create the Reading JSON object to be returned to JavaScript
     *
     * @return a magnetic sensor reading
     */
    private JSONObject getReading() throws JSONException {
        JSONObject obj = new JSONObject();

        obj.put("ax", this.ax);
        obj.put("ay", this.ay);
        obj.put("az", this.az);

        obj.put("mx", this.mx);
        obj.put("my", this.my);
        obj.put("mz", this.mz);

        obj.put("gx", this.gx);
        obj.put("gy", this.gy);
        obj.put("gz", this.gz);

        double x2 = Float.valueOf(this.mx * this.mx).doubleValue();
        double y2 = Float.valueOf(this.my * this.my).doubleValue();
        double z2 = Float.valueOf(this.mz * this.mz).doubleValue();

        obj.put("magnitude", Math.sqrt(x2 + y2 + z2));

        return obj;
    }
}
